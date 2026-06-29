import LearnExplorer from "@/components/LearnExplorer";

export const metadata = {
  title: "Modules — Azure Academy",
  description: "All learning modules across Azure service categories",
};

export default function LearnPage() {
  return (
    <div className="content py-12">
      <LearnExplorer />
    </div>
  );
}