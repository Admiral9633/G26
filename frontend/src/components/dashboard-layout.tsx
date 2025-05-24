"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FireExtinguisher,
  CreditCard,
  Search,
  Settings,
  Plus,
  Building2,
  Upload,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { getFeuerwehren } from "@/lib/api";
import type { Feuerwehr } from "@/types";

const navigationData = {
  verwaltung: [
    {
      title: "Kostenträger",
      url: "/kostentraeger",
      icon: CreditCard,
    },
    {
      title: "JSON Import",
      url: "/import",
      icon: Upload,
    },
  ],
  quickActions: [
    {
      title: "Neue Feuerwehr",
      url: "/feuerwehr/neu",
      icon: Plus,
    },
    {
      title: "Neuer Kostenträger",
      url: "/kostentraeger/neu",
      icon: Building2,
    },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [feuerwehren, setFeuerwehren] = useState<Feuerwehr[]>([]);
  const [filteredFeuerwehren, setFilteredFeuerwehren] = useState<Feuerwehr[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeuerwehren = async () => {
      try {
        const data = await getFeuerwehren();
        setFeuerwehren(data);
        setFilteredFeuerwehren(data);
        setLoading(false);
      } catch (error) {
        console.error("Fehler beim Laden der Feuerwehren:", error);
        toast.error("Die Feuerwehren konnten nicht geladen werden.");
        setLoading(false);
      }
    };

    loadFeuerwehren();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFeuerwehren(feuerwehren);
    } else {
      const filtered = feuerwehren.filter(
        (feuerwehr) =>
          feuerwehr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feuerwehr.ort.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFeuerwehren(filtered);
    }
  }, [searchQuery, feuerwehren]);

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    if (segments[0] === "feuerwehr") {
      breadcrumbs.push({ title: "Feuerwehren", href: "/" });
      if (segments[1] && segments[1] !== "neu") {
        const feuerwehr = feuerwehren.find(
          (f) => f.id.toString() === segments[1]
        );
        breadcrumbs.push({
          title: feuerwehr?.name || `Feuerwehr ${segments[1]}`,
          href: `/feuerwehr/${segments[1]}`,
        });

        if (segments[2] === "patient") {
          breadcrumbs.push({
            title: "Patienten",
            href: `/feuerwehr/${segments[1]}`,
          });
          if (segments[3] && segments[3] !== "neu") {
            breadcrumbs.push({
              title: `Patient ${segments[3]}`,
              href: `/feuerwehr/${segments[1]}/patient/${segments[3]}`,
            });

            if (segments[4] === "untersuchung") {
              if (segments[5] === "neu") {
                breadcrumbs.push({ title: "Neue Untersuchung", href: "#" });
              } else if (segments[5]) {
                breadcrumbs.push({
                  title: `Untersuchung ${segments[5]}`,
                  href: `/feuerwehr/${segments[1]}/patient/${segments[3]}/untersuchung/${segments[5]}`,
                });
              }
            }
          } else if (segments[3] === "neu") {
            breadcrumbs.push({ title: "Neuer Patient", href: "#" });
          }
        } else if (segments[2] === "edit") {
          breadcrumbs.push({ title: "Bearbeiten", href: "#" });
        }
      } else if (segments[1] === "neu") {
        breadcrumbs.push({ title: "Neue Feuerwehr", href: "#" });
      }
    } else if (segments[0] === "kostentraeger") {
      breadcrumbs.push({ title: "Kostenträger", href: "/kostentraeger" });
      if (segments[1] && segments[1] !== "neu") {
        breadcrumbs.push({
          title: `Kostenträger ${segments[1]}`,
          href: `/kostentraeger/${segments[1]}`,
        });
      } else if (segments[1] === "neu") {
        breadcrumbs.push({ title: "Neuer Kostenträger", href: "#" });
      }
    } else if (segments[0] === "import") {
      breadcrumbs.push({ title: "JSON Import", href: "#" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <FireExtinguisher className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Feuerwehr</span>
                  <span className="text-xs">Management System</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <form>
            <SidebarGroup className="py-0">
              <SidebarGroupContent className="relative">
                <Label htmlFor="search" className="sr-only">
                  Feuerwehren durchsuchen
                </Label>
                <SidebarInput
                  id="search"
                  placeholder="Feuerwehren durchsuchen..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
              </SidebarGroupContent>
            </SidebarGroup>
          </form>
        </SidebarHeader>

        <SidebarContent>
          {/* Feuerwehren Gruppe */}
          <SidebarGroup>
            <SidebarGroupLabel>Feuerwehren</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Wird geladen...
                  </div>
                ) : filteredFeuerwehren.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    {searchQuery
                      ? "Keine Feuerwehren gefunden"
                      : "Keine Feuerwehren vorhanden"}
                  </div>
                ) : (
                  filteredFeuerwehren.map((feuerwehr) => (
                    <SidebarMenuItem key={feuerwehr.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(
                          `/feuerwehr/${feuerwehr.id}`
                        )}
                      >
                        <Link href={`/feuerwehr/${feuerwehr.id}`}>
                          <FireExtinguisher className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {feuerwehr.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {feuerwehr.ort}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Verwaltung Gruppe */}
          <SidebarGroup>
            <SidebarGroupLabel>Verwaltung</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.verwaltung.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Schnellaktionen Gruppe */}
          <SidebarGroup>
            <SidebarGroupLabel>Schnellaktionen</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.quickActions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="h-4 w-4" />
                <span>Einstellungen</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-2 py-1">
            <div className="text-xs text-muted-foreground">Version 1.0.0</div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
