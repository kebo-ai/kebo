import { useReducer, useCallback } from "react";
import * as Haptics from "expo-haptics";

export type NumberEntryType = 1 | 2;

// --- State ---

interface EntryState {
  // Mode 1 (pre-dotted / cents)
  cents: number;
  // Mode 2 (cent-less / calculator)
  wholePart: number;
  isEditingDecimal: boolean;
  firstDecimal: number;
  secondDecimal: number;
  assignedDecimals: 0 | 1 | 2;
}

const initialState: EntryState = {
  cents: 0,
  wholePart: 0,
  isEditingDecimal: false,
  firstDecimal: 0,
  secondDecimal: 0,
  assignedDecimals: 0,
};

// --- Actions ---

type Action =
  | { type: "digit"; digit: number; mode: NumberEntryType }
  | { type: "backspace"; mode: NumberEntryType }
  | { type: "decimal" }
  | { type: "reset" }
  | { type: "setFromCents"; cents: number; mode: NumberEntryType };

const MAX_CENTS = 99999999999; // $999,999,999.99
const MAX_WHOLE = 999999999; // $999,999,999

function reducer(state: EntryState, action: Action): EntryState {
  switch (action.type) {
    case "digit": {
      const { digit, mode } = action;

      if (mode === 1) {
        const next = state.cents * 10 + digit;
        if (next > MAX_CENTS) return state;
        return { ...state, cents: next };
      }

      // Mode 2
      if (state.isEditingDecimal) {
        if (state.assignedDecimals >= 2) return state;
        if (state.assignedDecimals === 0) {
          return { ...state, firstDecimal: digit, assignedDecimals: 1 };
        }
        return { ...state, secondDecimal: digit, assignedDecimals: 2 };
      }

      const next = state.wholePart * 10 + digit;
      if (next > MAX_WHOLE) return state;
      return { ...state, wholePart: next };
    }

    case "backspace": {
      if (action.mode === 1) {
        return { ...state, cents: Math.floor(state.cents / 10) };
      }

      // Mode 2
      if (!state.isEditingDecimal) {
        return { ...state, wholePart: Math.floor(state.wholePart / 10) };
      }
      if (state.assignedDecimals === 2) {
        return { ...state, secondDecimal: 0, assignedDecimals: 1 };
      }
      if (state.assignedDecimals === 1) {
        return { ...state, firstDecimal: 0, assignedDecimals: 0 };
      }
      return { ...state, isEditingDecimal: false };
    }

    case "decimal": {
      if (state.isEditingDecimal) return state;
      return { ...state, isEditingDecimal: true };
    }

    case "reset":
      return initialState;

    case "setFromCents": {
      const { cents, mode } = action;
      if (mode === 1) {
        return { ...initialState, cents };
      }
      // Mode 2
      const whole = Math.floor(cents / 100);
      const dec = cents % 100;
      const first = Math.floor(dec / 10);
      const second = dec % 10;

      if (dec === 0) {
        return { ...initialState, wholePart: whole };
      }
      if (second === 0) {
        return {
          ...initialState,
          wholePart: whole,
          isEditingDecimal: true,
          firstDecimal: first,
          assignedDecimals: 1,
        };
      }
      return {
        ...initialState,
        wholePart: whole,
        isEditingDecimal: true,
        firstDecimal: first,
        secondDecimal: second,
        assignedDecimals: 2,
      };
    }
  }
}

// --- Hook ---

export interface NumberEntryResult {
  entryType: NumberEntryType;
  amountInCents: number;
  // Mode 2 display info
  wholePart: number;
  decimalSuffix: string; // "" | "." | ".4" | ".45"
  handleDigit: (digit: number) => void;
  handleBackspace: () => void;
  handleDecimal: () => void;
  reset: () => void;
  setFromCents: (cents: number) => void;
}

export function useNumberEntry(
  entryType: NumberEntryType = 2,
): NumberEntryResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const amountInCents =
    entryType === 1
      ? state.cents
      : state.wholePart * 100 +
        (state.assignedDecimals >= 1 ? state.firstDecimal * 10 : 0) +
        (state.assignedDecimals >= 2 ? state.secondDecimal : 0);

  const decimalSuffix = (() => {
    if (!state.isEditingDecimal) return "";
    if (state.assignedDecimals === 0) return ".";
    if (state.assignedDecimals === 1) return `.${state.firstDecimal}`;
    return `.${state.firstDecimal}${state.secondDecimal}`;
  })();

  const handleDigit = useCallback(
    (digit: number) => {
      Haptics.selectionAsync();
      dispatch({ type: "digit", digit, mode: entryType });
    },
    [entryType],
  );

  const handleBackspace = useCallback(() => {
    Haptics.selectionAsync();
    dispatch({ type: "backspace", mode: entryType });
  }, [entryType]);

  const handleDecimal = useCallback(() => {
    if (entryType !== 2) return;
    Haptics.selectionAsync();
    dispatch({ type: "decimal" });
  }, [entryType]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const setFromCents = useCallback(
    (cents: number) => {
      dispatch({ type: "setFromCents", cents, mode: entryType });
    },
    [entryType],
  );

  return {
    entryType,
    amountInCents,
    wholePart: state.wholePart,
    decimalSuffix,
    handleDigit,
    handleBackspace,
    handleDecimal,
    reset,
    setFromCents,
  };
}
