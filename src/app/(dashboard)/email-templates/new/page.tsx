import { EmailTemplateForm } from "@/components/email-templates/EmailTemplateForm";

export default function NewEmailTemplatePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Email Template</h1>
        <p className="text-sm text-gray-500 mt-1">
          Design a reusable template for your candidate communications.
        </p>
      </div>

      <EmailTemplateForm />
    </div>
  );
}
