import CategoryGrid from "@/components/CategoryGrid";

export const metadata = {
  title: "Services — Azure Academy",
  description: "Browse all Azure service categories",
};

export default function ServicesPage() {
  return (
    <div className="content py-12">
      <CategoryGrid />
    </div>
  );
}