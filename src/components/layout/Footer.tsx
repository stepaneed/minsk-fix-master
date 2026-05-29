export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="font-semibold text-foreground">МастерФикс</div>
            <div>Ремонт бытовой техники в Минске</div>
          </div>
          <div>© {new Date().getFullYear()} Все права защищены</div>
        </div>
      </div>
    </footer>
  );
}
