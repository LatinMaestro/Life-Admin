import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { ShoppingResponse } from "@/lib/contracts";

export default function ShoppingScreen() {
  const state = useApiResource<ShoppingResponse>("/api/v1/shopping");
  const lists = state.data?.lists ?? [];
  const items = state.data?.items ?? [];

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Shopping" subtitle="The household lists, kept together." />
      <StatusView {...state} empty={Boolean(state.data) && lists.length === 0} onRetry={() => void state.refresh()} />
      {lists.map((list) => {
        const listItems = items.filter((item) => item.shoppingListId === list.id);
        return (
          <Section key={list.id} title={list.name}>
            {listItems.length === 0 ? <Row title="Nothing needed" /> : null}
            {listItems.map((item) => (
              <Row
                key={item.id}
                title={item.label}
                detail={item.notes}
                meta={item.quantity ? `Quantity: ${item.quantity}` : item.category}
                trailing={item.checked ? <Pill>Done</Pill> : null}
              />
            ))}
          </Section>
        );
      })}
    </Screen>
  );
}
