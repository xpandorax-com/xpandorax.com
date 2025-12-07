import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Users, Search, Grid, List } from "lucide-react";
import { cn } from "~/lib/utils";
import { createSanityClient, getSlug, type SanityActress } from "~/lib/sanity";

export const meta: MetaFunction = () => {
  return [
    { title: "Models - XpandoraX" },
    { name: "description", content: "Browse all models on XpandoraX." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const sort = url.searchParams.get("sort") || "popular";
  const search = url.searchParams.get("search")?.trim() || "";
  const limit = 36;
  const offset = (page - 1) * limit;

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
    ? `&& (name match "*${search}*" || bio match "*${search}*")`
    : "";

  // Fetch models with pagination
  const [actressesRaw, totalCount] = await Promise.all([
    sanity.fetch<(SanityActress & { videoCount: number })[]>(
      `*[_type == "actress" ${searchFilter}] {
        _id,
        name,
        slug,
        "image": image.asset->url,
        "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true])
      } | order(${orderBy}) [$offset...$end]`,
      { offset, end: offset + limit }
    ),
    sanity.fetch<number>(
      `count(*[_type == "actress" ${searchFilter}])`
    ),
  ]);

  const actressList = actressesRaw.map((a) => ({
    id: a._id,
    slug: getSlug(a.slug),
    name: a.name,
    image: a.image || null,
    videoCount: a.videoCount || 0,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return json({
    actresses: actressList,
    total: totalCount,
    page,
    totalPages,
    sort,
    search,
  });
}

export default function ModelsPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Models
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse {data.total.toLocaleString()} models
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              defaultValue={data.search}
              placeholder="Search models..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Select value={data.sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Videos</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {data.actresses.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.actresses.map((actress) => (
              <a
                key={actress.id}
                href={`/model/${actress.slug}`}
                className="group rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden rounded-full mb-3 ring-2 ring-transparent group-hover:ring-primary transition-all">
                  {actress.image ? (
                    <img
                      src={actress.image}
                      alt={actress.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-center truncate group-hover:text-primary transition-colors">
                  {actress.name}
                </h3>
                <p className="text-xs text-center text-muted-foreground">
                  {actress.videoCount || 0} videos
                </p>
              </a>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {data.page > 1 && (
                <Button variant="outline" asChild>
                  <a
                    href={`/models?${new URLSearchParams({
                      sort: data.sort,
                      ...(data.search && { search: data.search }),
                      page: String(data.page - 1),
                    })}`}
                  >
                    Previous
                  </a>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              {data.page < data.totalPages && (
                <Button variant="outline" asChild>
                  <a
                    href={`/models?${new URLSearchParams({
                      sort: data.sort,
                      ...(data.search && { search: data.search }),
                      page: String(data.page + 1),
                    })}`}
                  >
                    Next
                  </a>
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Users className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Models Found</h2>
          <p className="mt-2 text-muted-foreground">
            {data.search
              ? `No models matching "${data.search}"`
              : "No models available yet."}
          </p>
          {data.search && (
            <Button asChild variant="outline" className="mt-4">
              <a href="/models">Clear Search</a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
