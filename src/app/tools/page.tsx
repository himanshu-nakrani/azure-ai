import ToolsWorkbench from "@/components/ToolsWorkbench";

export const metadata = {
  title: "Tools — Azure Academy",
  description: "Interactive Azure learning tools",
};

export default function ToolsPage() {
  return (
    <div className="content py-12">
      <ToolsWorkbench />
    </div>
  );
}