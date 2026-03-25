const STATUS_STYLES: Record<string, string> = {
  new: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  contacted: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  bounced: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  responded: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  converted: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  unsubscribed: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
};

export function OutreachStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STATUS_STYLES[status] ?? STATUS_STYLES.new
      }`}
    >
      {status}
    </span>
  );
}
