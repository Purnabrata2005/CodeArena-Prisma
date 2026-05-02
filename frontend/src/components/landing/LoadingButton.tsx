import { Button, Spinner } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type LoadingButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
	children: ReactNode;
	isLoading?: boolean;
	loadingText?: ReactNode;
	startContent?: ReactNode;
};

export default function LoadingButton({
	children,
	isLoading = false,
	loadingText = "Loading...",
	startContent,
	className,
	...props
}: LoadingButtonProps) {
	return (
		<Button
			{...props}
			isPending={isLoading}
			className={cn(
				"transition-all duration-300 ease-out data-[pending=true]:min-w-44 data-[pending=true]:px-6 data-[pending=true]:shadow-lg data-[pending=true]:scale-[1.02]",
				className,
			)}
		>
			{({ isPending }) => (
				<span className="flex items-center gap-2 whitespace-nowrap">
					{isPending ? <Spinner color="current" size="sm" /> : startContent}
					<span>{isPending ? loadingText : children}</span>
				</span>
			)}
		</Button>
	);
}

