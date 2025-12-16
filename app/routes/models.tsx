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
import { Users, Search } from "lucide-react";
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
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          Models
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
          Browse {data.total.toLocaleString()} models
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              defaultValue={data.search}
              placeholder="Search models..."
              className="pl-10 h-10 touch-target"
            />
          </div>
          <Button type="submit" className="touch-target h-10">Search</Button>
        </form>

        <Select value={data.sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 touch-target">
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
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.actresses.map((actress) => (
              <a
                key={actress.id}
                href={`/model/${actress.slug}`}
                className="group rounded-lg border bg-card p-2 sm:p-4 transition-all hover:bg-accent hover:shadow-md active:scale-[0.98] touch-target"
              >
                <div className="aspect-square overflow-hidden rounded-full mb-2 sm:mb-3 ring-2 ring-transparent group-hover:ring-primary transition-all">
                  {actress.image ? (
                    <img
                      src={actress.image}
                      alt={actress.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-center text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                  {actress.name}
                </h3>
                <p className="text-2xs sm:text-xs text-center text-muted-foreground">
                  {actress.videoCount || 0} videos
                </p>
              </a>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                {data.page > 1 && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
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
                {data.page < data.totalPages && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
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
              <span className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">
                Page {data.page} of {data.totalPages}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <Users className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
          <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold">No Models Found</h2>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            {data.search
              ? `No models matching "${data.search}"`
              : "No models available yet."}
          </p>
          {data.search && (
            <Button asChild variant="outline" className="mt-4 touch-target">
              <a href="/models">Clear Search</a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
