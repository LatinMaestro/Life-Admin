import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";

import { PageTitle, Screen, Section, uiStyles } from "@/components/ui";
import { colors } from "@/lib/theme";

const destinations = [
  { href: "/bills", label: "Bills & renewals" },
  { href: "/family", label: "Family" },
  { href: "/sources", label: "Sources" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
] as const;

export default function MoreScreen() {
  return (
    <Screen>
      <PageTitle title="More" />
      <Section title="Household">
        {destinations.map((item) => (
          <Link asChild href={item.href} key={item.href}>
            <Pressable accessibilityRole="link" style={uiStyles.linkRow}>
              <Text style={uiStyles.linkText}>{item.label}</Text>
              <Ionicons color={colors.muted} name="chevron-forward" size={20} />
            </Pressable>
          </Link>
        ))}
      </Section>
    </Screen>
  );
}
