/**
 * KeypadModal Component
 * (Ported from designSystem)
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppTranslation } from "@/utils/i18n";
import { Modal } from "./Modal";

// Reusing types locally or adapting
type KeypadVariant = "number" | "phone" | "time";
const TIME_MAX_DIGITS = 4;

const sanitizeTimeValue = (value?: string): string => {
	if (!value) return "";
	return value.replace(/[^0-9]/g, "").slice(0, TIME_MAX_DIGITS);
};

const formatTimeDisplay = (value: string): string => {
	const padded = value.padEnd(TIME_MAX_DIGITS, "_");
	return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
};

const isValidTimeDigits = (value: string): boolean => {
	if (value.length !== TIME_MAX_DIGITS) return false;
	const hours = Number.parseInt(value.slice(0, 2), 10);
	const minutes = Number.parseInt(value.slice(2, 4), 10);
	return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const toFormattedTime = (value: string): string =>
	`${value.slice(0, 2)}:${value.slice(2, 4)}`;

interface UnifiedKeypadModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (value: string) => void;
	variant?: KeypadVariant;
	initialValue?: string;
	title?: string;
	placeholder?: string;
	maxLength?: number;
	allowDecimal?: boolean;
}

interface KeypadLayoutProps {
	open: boolean;
	title: string;
	onClose: () => void;
	displayContent: React.ReactNode;
	errorMessage?: string;
	onNumberClick: (digit: string) => void;
	onBackspace: () => void;
	onClear: () => void;
	onConfirm: () => void;
	additionalButton?: React.ReactNode;
}

const KeypadModalLayout: React.FC<KeypadLayoutProps> = React.memo(
	({
		open,
		title,
		onClose,
		displayContent,
		errorMessage,
		onNumberClick,
		onBackspace,
		onClear,
		onConfirm,
		additionalButton,
	}) => (
		<Modal
			open={open}
			onOpenChange={(isOpen) => !isOpen && onClose()}
			title={title}
			onClose={onClose}
		>
			<div className="flex flex-col gap-4">
				<div className="bg-card border-2 border-theme-text-primary rounded-lg p-[var(--ui-modal-padding)] min-h-[60px] flex items-center justify-center text-lg font-semibold text-foreground">
					{displayContent}
				</div>
				{errorMessage && (
					<div className="text-destructive text-sm text-center p-ui-gap bg-destructive/10 rounded-md border-l-[3px] border-destructive">
						{errorMessage}
					</div>
				)}
				<div className="grid grid-cols-3 gap-ui-gap">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
						<button
							key={num}
							type="button"
							onClick={() => onNumberClick(num.toString())}
							className="min-h-[var(--ui-keypad-button-height)] text-lg font-semibold bg-background text-foreground border-2 border-theme-text-primary rounded-lg cursor-pointer transition-all active:scale-95 active:brightness-90 hover:brightness-110"
						>
							{num}
						</button>
					))}
					{additionalButton || (
						<div className="min-h-[var(--ui-keypad-button-height)] bg-card rounded-lg" />
					)}
					<button
						type="button"
						onClick={() => onNumberClick("0")}
						className="min-h-[var(--ui-keypad-button-height)] text-lg font-semibold bg-background text-foreground border-2 border-theme-text-primary rounded-lg cursor-pointer transition-all active:scale-95 active:brightness-90 hover:brightness-110"
					>
						0
					</button>
					<button
						type="button"
						onClick={onBackspace}
						className="min-h-[var(--ui-keypad-button-height)] text-base font-semibold bg-background text-foreground border-2 border-theme-text-primary rounded-lg cursor-pointer transition-all active:scale-95 active:brightness-90 hover:brightness-110"
					>
						⌫
					</button>
				</div>
				<div className="grid grid-cols-2 gap-ui-gap mt-2">
					<button
						type="button"
						onClick={onClear}
						className="min-h-[var(--ui-keypad-button-height)] text-base font-semibold bg-background text-foreground border-2 border-theme-text-primary rounded-lg cursor-pointer transition-all active:scale-95 active:bg-destructive active:text-white active:border-theme-danger hover:bg-destructive hover:text-white hover:border-theme-danger"
					>
						C
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="min-h-[var(--ui-keypad-button-height)] text-base font-semibold bg-background text-foreground border-2 border-theme-text-primary rounded-lg cursor-pointer transition-all active:scale-95 active:brightness-90 hover:brightness-110"
					>
						OK
					</button>
				</div>
			</div>
		</Modal>
	),
);

const variantDefaults: Record<
	KeypadVariant,
	{ titleKey: string; placeholder: string; maxLength: number }
> = {
	number: {
		titleKey: "keypad_title_number",
		placeholder: "",
		maxLength: 10,
	},
	phone: {
		titleKey: "keypad_title_phone",
		placeholder: "090-0000-0000",
		maxLength: 13,
	},
	time: {
		titleKey: "keypad_title_time",
		placeholder: "__:__",
		maxLength: TIME_MAX_DIGITS,
	},
};

export const KeypadModal: React.FC<UnifiedKeypadModalProps> = React.memo(
	({
		open,
		onClose,
		onSubmit,
		variant = "number",
		initialValue = "",
		title,
		placeholder,
		maxLength,
		allowDecimal = false,
	}) => {
		const { t } = useAppTranslation();
		const sanitizedInitialValue = useMemo(
			() =>
				variant === "time" ? sanitizeTimeValue(initialValue) : initialValue,
			[variant, initialValue],
		);
		const [value, setValue] = useState(sanitizedInitialValue);
		const [error, setError] = useState("");
		// Track if the value is "pristine" (untouched since open)
		const [isPristine, setIsPristine] = useState(true);

		const config = useMemo(() => variantDefaults[variant], [variant]);
		const resolvedTitle = title ?? t(config.titleKey);
		const resolvedPlaceholder = placeholder ?? config.placeholder;
		const resolvedMaxLength =
			variant === "time" ? TIME_MAX_DIGITS : (maxLength ?? config.maxLength);
		const canUseDecimal = variant === "number" && allowDecimal;
		const canUseHyphen = variant === "phone";
		const isTimeVariant = variant === "time";

		useEffect(() => {
			if (open) {
				setValue(sanitizedInitialValue);
				setError("");
				setIsPristine(true);
			}
		}, [open, sanitizedInitialValue]);

		const handleNumberClick = useCallback(
			(digit: string) => {
				// If pristine, we treat previous value as empty for the sake of input
				setIsPristine(false);

				if (isTimeVariant) {
					setValue((prev) => {
						const effectivePrev = isPristine ? "" : prev;

						if (effectivePrev.length >= TIME_MAX_DIGITS) {
							setError(
								t("keypad_error_max_length", {
									defaultValue: `Up to ${TIME_MAX_DIGITS} characters`,
									max: TIME_MAX_DIGITS,
								}),
							);
							return effectivePrev;
						}
						setError("");
						if (effectivePrev.length === 0) {
							const num = Number.parseInt(digit, 10);
							if (num >= 3) {
								return `0${digit}`;
							}
						}
						return (effectivePrev + digit).slice(0, TIME_MAX_DIGITS);
					});
					return;
				}

				setValue((prev) => {
					const effectivePrev = isPristine ? "" : prev;

					if (effectivePrev.length >= resolvedMaxLength) {
						setError(
							t("keypad_error_max_length", {
								defaultValue: `Up to ${resolvedMaxLength} characters`,
								max: resolvedMaxLength,
							}),
						);
						return effectivePrev;
					}
					setError("");
					return `${effectivePrev}${digit}`;
				});
			},
			[resolvedMaxLength, isTimeVariant, isPristine, t],
		);

		const handleHyphenClick = useCallback(() => {
			if (!canUseHyphen) return;
			setIsPristine(false);
			setValue((prev) => {
				const effectivePrev = isPristine ? "" : prev;

				if (effectivePrev.length >= resolvedMaxLength) {
					setError(
						t("keypad_error_max_length", {
							defaultValue: `Up to ${resolvedMaxLength} characters`,
							max: resolvedMaxLength,
						}),
					);
					return effectivePrev;
				}
				if (effectivePrev.endsWith("-")) {
					setError(t("keypad_error_hyphen_repeat"));
					return effectivePrev;
				}
				setError("");
				return `${effectivePrev}-`;
			});
		}, [canUseHyphen, resolvedMaxLength, isPristine, t]);

		const handleDecimalClick = useCallback(() => {
			if (!canUseDecimal) return;
			setIsPristine(false);
			setValue((prev) => {
				const effectivePrev = isPristine ? "" : prev;

				if (effectivePrev.includes(".")) {
					setError(t("keypad_error_decimal_repeat"));
					return effectivePrev;
				}
				setError("");
				return `${effectivePrev}.`;
			});
		}, [canUseDecimal, isPristine, t]);

		const handleBackspace = useCallback(() => {
			setIsPristine(false);
			setValue((prev) => prev.slice(0, -1));
			setError("");
		}, []);

		const handleClear = useCallback(() => {
			setIsPristine(false);
			setValue("");
			setError("");
		}, []);

		const handleSubmit = useCallback(() => {
			if (isTimeVariant) {
				setValue((currentValue) => {
					if (!isValidTimeDigits(currentValue)) {
						setError(t("keypad_error_time_invalid"));
						return currentValue;
					}
					onSubmit(toFormattedTime(currentValue));
					return currentValue;
				});
				return;
			}

			setValue((currentValue) => {
				if (currentValue === "") {
					setError(t("keypad_error_value_required"));
					return currentValue;
				}
				if (canUseDecimal && currentValue.endsWith(".")) {
					setError(t("keypad_error_decimal_end"));
					return currentValue;
				}
				if (canUseHyphen && currentValue.endsWith("-")) {
					setError(t("keypad_error_hyphen_end"));
					return currentValue;
				}
				onSubmit(currentValue);
				return currentValue;
			});
		}, [canUseDecimal, canUseHyphen, isTimeVariant, onSubmit, t]);

		useEffect(() => {
			if (!open) return;

			const handleKeyDown = (e: KeyboardEvent) => {
				if (
					(e.key >= "0" && e.key <= "9") ||
					(e.code >= "Numpad0" && e.code <= "Numpad9")
				) {
					e.preventDefault();
					handleNumberClick(e.key);
				} else if (
					canUseHyphen &&
					(e.key === "-" || e.code === "NumpadSubtract" || e.key === "Minus")
				) {
					e.preventDefault();
					handleHyphenClick();
				} else if (
					canUseDecimal &&
					(e.key === "." || e.code === "NumpadDecimal")
				) {
					e.preventDefault();
					handleDecimalClick();
				} else if (e.key === "Backspace") {
					e.preventDefault();
					handleBackspace();
				} else if (e.key === "Enter") {
					e.preventDefault();
					handleSubmit();
				} else if (e.key === "Escape") {
					e.preventDefault();
					onClose();
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [
			open,
			canUseHyphen,
			canUseDecimal,
			onClose,
			handleNumberClick,
			handleHyphenClick,
			handleDecimalClick,
			handleBackspace,
			handleSubmit,
		]);

		const displayContent = isTimeVariant ? (
			<div className="flex flex-col items-center justify-center gap-2 w-full">
				<span
					style={{
						fontSize: "24px",
						fontFamily: "monospace",
						color: "hsl(var(--foreground))",
						letterSpacing: "2px",
						fontWeight: 600,
					}}
				>
					{formatTimeDisplay(value)}
				</span>
				<span
					style={{ fontSize: "12px", color: "var(--theme-text-secondary)" }}
				>
					入力: {value.padEnd(TIME_MAX_DIGITS, "・")}
				</span>
			</div>
		) : (
			<span
				style={{
					fontSize: "24px",
					fontFamily: "monospace",
					color: "hsl(var(--foreground))",
					fontWeight: 600,
				}}
			>
				{value || (
					<span style={{ color: "var(--theme-text-secondary)" }}>
						{resolvedPlaceholder}
					</span>
				)}
			</span>
		);

		const additionalButton = useMemo(() => {
			if (canUseHyphen || canUseDecimal) {
				const label = canUseHyphen ? "-" : ".";
				const clickHandler = canUseHyphen
					? handleHyphenClick
					: handleDecimalClick;
				return (
					<button
						type="button"
						onClick={clickHandler}
						className="min-h-[var(--ui-keypad-button-height)] text-lg font-semibold bg-background text-foreground border-2 border-theme-text-primary rounded-lg cursor-pointer transition-all active:scale-95 active:brightness-90 hover:brightness-110"
					>
						{label}
					</button>
				);
			}
			return undefined;
		}, [canUseHyphen, canUseDecimal, handleHyphenClick, handleDecimalClick]);

		return (
			<KeypadModalLayout
				open={open}
				title={resolvedTitle}
				onClose={onClose}
				displayContent={displayContent}
				errorMessage={error}
				onNumberClick={handleNumberClick}
				onBackspace={handleBackspace}
				onClear={handleClear}
				onConfirm={handleSubmit}
				additionalButton={additionalButton}
			/>
		);
	},
);

KeypadModal.displayName = "KeypadModal";

export default KeypadModal;
