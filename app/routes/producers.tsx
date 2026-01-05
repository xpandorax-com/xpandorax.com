import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Building2, Search, Video } from "lucide-react";
import { createSanityClient, getSlug } from "~/lib/sanity";

export const meta: MetaFunction = () => {
  return [
    { title: "Producers - XpandoraX" },
    { name: "description", content: "Browse all producers and studios on XpandoraX." },
  ];
};

interface Producer {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  description: string | null;
  videoCount: number;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const sort = url.searchParams.get("sort") || "popular";
  const search = url.searchParams.get("search")?.trim() || "";
  const limit = 36;
  const offset = (page - 1) * limit;

  try {
    const sanity = createSanityClient(context.cloudflare.env);

    // Build order by based on sort
    let orderBy;
    switch (sort) {
      case "name":
        orderBy = "name asc";
        break;
      case "newest":
        orderBy = "_createdAt desc";
        break;
      case "popular":
      default:
        orderBy = "videoCount desc";
        break;
    }

    // Build search filter
    const searchFilter = search
      ? `&& (name match "*${search}*" || description match "*${search}*")`
      : "";

    // Fetch producers with pagination
    const [producersRaw, totalCount] = await Promise.all([
      sanity.fetch<Array<{
        _id: string;
        name: string;
        slug: { current: string } | string;
        logo?: string;
        description?: string;
        videoCount: number;
      }>>(
        `*[_type == "producer" ${searchFilter}] {
          _id,
          name,
          slug,
          "logo": logo.asset->url,
          description,
          "videoCount": count(*[_type == "video" && producer._ref == ^._id && isPublished == true])
        } | order(${orderBy}) [$offset...$end]`,
        { offset, end: offset + limit }
      ),
      sanity.fetch<number>(
        `count(*[_type == "producer" ${searchFilter}])`
      ),
    ]);

    const producersList: Producer[] = producersRaw.map((p) => ({
      id: p._id,
      slug: getSlug(p.slug),
      name: p.name,
      logo: p.logo || null,
      description: p.description || null,
      videoCount: p.videoCount || 0,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return json({
      producers: producersList,
      total: totalCount,
      page,
      totalPages,
      sort,
      search,
    });
  } catch (error) {
    console.error("Producers loader error:", error);
    return json({
      producers: [],
      total: 0,
      page: 1,
      totalPages: 0,
      sort,
      search,
      error: "Failed to load producers",
    });
  }
}

export default function ProducersPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          Producers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse {data.total} producers and studios
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            name="search"
            placeholder="Search producers..."
            defaultValue={data.search}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Select value={data.sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Videos</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Producers Grid */}
      {data.producers.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.producers.map((producer) => (
              <Link
                key={producer.id}
                to={`/producer/${producer.slug}`}
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:ring-2 hover:ring-primary"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {producer.logo ? (
                    <img
                      src={producer.logo}
                      alt={producer.name}
                      className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {producer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Video className="h-3 w-3" />
                    {producer.videoCount} videos
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {data.page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    to={`/producers?page=${data.page - 1}${data.sort !== "popular" ? `&sort=${data.sort}` : ""}${data.search ? `&search=${data.search}` : ""}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              {data.page < data.totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    to={`/producers?page=${data.page + 1}${data.sort !== "popular" ? `&sort=${data.sort}` : ""}${data.search ? `&search=${data.search}` : ""}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {data.search
              ? `No producers found matching "${data.search}"`
              : "No producers available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
