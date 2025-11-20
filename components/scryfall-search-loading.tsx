export function ScryfallSearchLoading({ args }: { args: any }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">
        Searching Scryfall for cards matching:
      </div>
      <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
        <code>{args.query}</code>
      </div>
    </div>
  );
}
