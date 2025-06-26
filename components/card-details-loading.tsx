export function CardDetailsLoading({ args }: { args: any }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">
        Searching MTG cards + rulings for:
      </div>
      <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
        <code>{JSON.stringify(args.cardNames)}</code>
      </div>
    </div>
  );
}
