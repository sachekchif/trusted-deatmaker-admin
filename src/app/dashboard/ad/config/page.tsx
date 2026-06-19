import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  AppWindow,
  Wrench,
  Bell,
  CreditCard,
  Landmark,
  Search,
  LayoutTemplate,
  ClipboardList,
  CircleDollarSign,
  IdCard,
  User,
  Languages,
  Component,
  Shield,
  PenTool,
  Cookie,
  FileCode,
  Gavel,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";

interface ConfigItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
}

const configItems: ConfigItem[] = [
  {
    title: "Dispute Configuration",
    description: "Manage global dispute logic, timers, and arbitration rules",
    href: "/dashboard/ad/config/dispute-config",
    icon: Shield,
  },
  {
    title: "Dispute Options",
    description: "Configure reasons and preferred resolution methods",
    href: "/dashboard/ad/config/dispute-resolution",
    icon: Shield,
  },
  {
    title: "General Settings",
    description: "Configure the fundamental information of the site",
    href: "/dashboard/ad/config/general",
    icon: Settings,
  },
  {
    title: "Logo and Favicon",
    description: "Upload your logo and favicon here",
    href: "/dashboard/ad/config/logo-favicon",
    icon: AppWindow,
  },
  {
    title: "System Configuration",
    description: "Control all of the basic modules of the system",
    href: "/dashboard/ad/config/system-configuration",
    icon: Wrench,
  },
  {
    title: "Notification Settings",
    description: "Control and configure overall notification elements of the system",
    href: "/dashboard/ad/config/notification-settings",
    icon: Bell,
  },
  {
    title: "Payment Gateways",
    description: "Set up auto or manual payment gateways for user payments.",
    href: "/dashboard/ad/config/payments",
    icon: CreditCard,
  },
  {
    title: "Withdrawals Method",
    description: "Add manual withdrawal methods for user payout requests.",
    href: "/dashboard/ad/config/withdrawals",
    icon: Landmark,
  },
  {
    title: "SEO Configuration",
    description: "Set meta titles, descriptions, and keywords for SEO.",
    href: "/dashboard/ad/config/seo",
    icon: Search,
  },
  {
    title: "Manage Frontend",
    description: "Manage all frontend content.",
    href: "/dashboard/ad/config/manage-frontend",
    icon: LayoutTemplate,
  },
  {
    title: "Manage Pages",
    description: "Manage dynamic and static pages",
    href: "/dashboard/ad/config/manage-pages",
    icon: ClipboardList,
  },
  {
    title: "Charge Settings",
    description: "Set your system charge here.",
    href: "/dashboard/ad/config/currency-settings",
    icon: CircleDollarSign,
  },
  {
    title: "KYC Settings",
    description: "Set the input field to collect client info if needed.",
    href: "/dashboard/ad/config/kyc-settings",
    icon: IdCard,
  },
  {
    title: "Social Login Settings",
    description: "Enter details to enable social media login.",
    href: "/dashboard/ad/config/social-credentials",
    icon: User,
  },
  {
    title: "Language",
    description: "Set your languages and keywords for localization.",
    href: "/dashboard/ad/config/language-manager",
    icon: Languages,
  },
  {
    title: "Extensions",
    description: "Manage extensions to add extra features.",
    href: "/dashboard/ad/config/extensions",
    icon: Component,
  },
  {
    title: "Policy Pages",
    description: "Set your system policy and terms here.",
    href: "/dashboard/ad/config/policy-pages",
    icon: Shield,
  },
  {
    title: "Maintenance Mode",
    description: "Toggle maintenance mode as needed.",
    href: "/dashboard/ad/config/maintenance",
    icon: PenTool,
  },
  {
    title: "GDPR Cookie",
    description: "Enable GDPR cookies to request visitor consent.",
    href: "/dashboard/ad/config/gdpr-cookie",
    icon: Cookie,
  },
  {
    title: "Custom CSS",
    description: "Add custom CSS to adjust frontend styles.",
    href: "#",
    icon: FileCode,
  },
  {
    title: "Configure Dispute",
    description: "Toggle Dispute resolution as needed.",
    href: "/dashboard/ad/config/dispute-resolution",
    icon: Gavel,
  },
  {
    title: "Payment Time",
    description: "Manage Payment time for different Transactions",
    href: "/dashboard/ad/config/system-timers",
    icon: Wallet,
  },
  {
    title: "Manage Features",
    description: "Manage Milestones, Bids, Orders e.t.c",
    href: "/dashboard/ad/config/transaction-flow",
    icon: SlidersHorizontal,
  },
];

export default function ConfigOverviewPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold text-gray-900">
          All Categories
        </h1>
      </div>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {configItems.map((item, index) => (
            <Link key={index} href={item.href} className="group block">
              <Card className="h-full border-none shadow-sm bg-[#f2f9fd] hover:bg-[#e6f4fa] transition-colors duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#0092ca] p-3.5 rounded-xl flex-shrink-0">
                      <item.icon
                        className="w-7 h-7 text-white"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-[17px] font-semibold text-gray-900 mb-1 group-hover:text-[#0092ca] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[14px] text-gray-500 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link> 
          ))}
        </div>
      </section>
    </div>
  );
}
