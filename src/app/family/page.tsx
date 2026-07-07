import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { familyMembers, householdName } from "@/lib/demo-data";

export default function FamilyPage() {
  return (
    <>
      <PageHeader
        title="Family"
        description="A household-first member view with simple MVP roles. Invitations and authentication are not implemented yet."
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Invite
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>{householdName}</CardTitle>
            <CardDescription>Sample household members and roles.</CardDescription>
          </CardHeader>
          <CardContent>
            {familyMembers.map((member) => (
              <ItemRow
                key={member.name}
                title={member.name}
                detail={member.note}
                status={member.role}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role model</CardTitle>
            <CardDescription>MVP keeps permissions simple and household-scoped.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Household admins can manage members and settings once auth is approved.
            </p>
            <p>
              Household members can participate in shared admin workflows for the household.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
