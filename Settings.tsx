import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

const Forms = findByProps("FormSwitchRow", "FormRadioRow", "FormSection", "FormRow");

export default function Settings() {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  const { FormSwitchRow, FormRadioRow, FormSection } = Forms ?? {};
  if (!FormSwitchRow || !FormRadioRow || !FormSection) {
    // Fallback in case the host app's Forms module names have shifted —
    // better a plain message than a hard crash on the settings page.
    return null;
  }

  return (
    <FormSection title="Double Tap Action" sectionTitle="Double Tap Action">
      <FormRadioRow
        label="Edit"
        subLabel="Only works on your own messages"
        selected={storage.doubleTapAction === "edit"}
        onPress={() => {
          storage.doubleTapAction = "edit";
          forceUpdate();
        }}
      />
      <FormRadioRow
        label="Delete"
        subLabel="Your own messages, or any message you can moderate"
        selected={storage.doubleTapAction === "delete"}
        onPress={() => {
          storage.doubleTapAction = "delete";
          forceUpdate();
        }}
      />
      <FormSwitchRow
        label="Confirm before deleting"
        subLabel="Show a confirmation dialog before a double-tap delete goes through"
        value={!!storage.confirmDelete}
        onValueChange={(v: boolean) => {
          storage.confirmDelete = v;
          forceUpdate();
        }}
      />
    </FormSection>
  );
}
