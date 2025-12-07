import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { desc, sql, eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { actresses } from "~/db/schema";
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

  const db = createDatabase(context.cloudflare.env.DATABASE);

  let query = db.select().from(actresses).$dynamic();

  // Apply search filter
  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    query = query.where(sql`lower(${actresses.name}) like ${searchTerm}`);
  }

  // Apply sorting
  switch (sort) {
    case "name":
      query = query.orderBy(actresses.name);
      break;
    case "newest":
      query = query.orderBy(desc(actresses.createdAt));
      break;
    case "popular":
    default:
      query = query.orderBy(desc(actresses.videoCount));
      break;
  }

  const [actressList, totalResult] = await Promise.all([
    query.limit(limit).offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(actresses)
      .where(
        search
          ? sql`lower(${actresses.name}) like ${`%${search.toLowerCase()}%`}`
          : undefined
      ),
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return json({
    actresses: actressList,
    total,
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
