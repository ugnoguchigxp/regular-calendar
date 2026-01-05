import { useMemo, useState } from "react";
import type { PaginationOptions, Resource } from "../FacilitySchedule.schema";

interface UseResourcePaginationProps {
	allResources: Resource[];
	paginationOptions?: PaginationOptions;
}

interface UseResourcePaginationResult {
	paginatedResources: Resource[];
	currentPage: number;
	totalPages: number;
	goToPage: (page: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	isPaginated: boolean;
	pageSize: number;
	totalResources: number;
	pageInfo: { page: number; startResource: string; endResource: string }[];
}

/**
 * Hook to handle "balanced" pagination for resources.
 * Distributes resources evenly across pages.
 * Example: 10 items, max 8 per page -> 2 pages with 5 items each.
 */
export function useResourcePagination({
	allResources,
	paginationOptions,
}: UseResourcePaginationProps): UseResourcePaginationResult {
	const [currentPage, setCurrentPage] = useState(0);

	const isPaginated = paginationOptions?.enabled ?? false;
	const maxPerPage = paginationOptions?.pageSize ?? 8;
	const totalResources = allResources.length;

	const { totalPages, pageDistribution } = useMemo(() => {
		if (!isPaginated || totalResources === 0) {
			return { totalPages: 1, pageDistribution: [totalResources] };
		}

		if (totalResources <= maxPerPage) {
			return { totalPages: 1, pageDistribution: [totalResources] };
		}

		const pages = Math.ceil(totalResources / maxPerPage);
		const baseItems = Math.floor(totalResources / pages);
		const remainder = totalResources % pages;

		const distribution: number[] = [];
		for (let i = 0; i < pages; i++) {
			// Distribute remainder one by one to the first few pages?
			// Or just simple division?
			// The requirement says: 10 items, max 8 -> 5:5.
			// 10 / 8 = ceil(1.25) = 2 pages.
			// 10 / 2 = 5 items per page. Remainder 0.

			// 17 items, max 8 -> ceil(2.125) = 3 pages.
			// 17 / 3 = 5 base items. Remainder 2.
			// Page 0: 5+1 = 6
			// Page 1: 5+1 = 6
			// Page 2: 5
			// Total: 6+6+5 = 17. Correct.

			const itemsCount = i < remainder ? baseItems + 1 : baseItems;
			distribution.push(itemsCount);
		}

		return { totalPages: pages, pageDistribution: distribution };
	}, [isPaginated, totalResources, maxPerPage]);

	// Ensure current page is valid
	if (currentPage >= totalPages && totalPages > 0) {
		setCurrentPage(totalPages - 1);
	}

	const paginatedResources = useMemo(() => {
		if (!isPaginated) return allResources;

		// Calculate start index for current page based on variable page sizes
		let startIndex = 0;
		for (let i = 0; i < currentPage; i++) {
			startIndex += pageDistribution[i] || 0;
		}

		const currentLimit = pageDistribution[currentPage] || allResources.length;
		return allResources.slice(startIndex, startIndex + currentLimit);
	}, [allResources, isPaginated, currentPage, pageDistribution]);

	const goToPage = (page: number) => {
		const target = Math.max(0, Math.min(page, totalPages - 1));
		setCurrentPage(target);
	};

	const nextPage = () => goToPage(currentPage + 1);
	const prevPage = () => goToPage(currentPage - 1);

	const pageInfo = useMemo(() => {
		if (!isPaginated || totalPages <= 1) return [];

		const info: { page: number; startResource: string; endResource: string }[] =
			[];
		let currentIndex = 0;

		for (let i = 0; i < totalPages; i++) {
			const count = pageDistribution[i];
			const startRes = allResources[currentIndex];
			const endRes = allResources[currentIndex + count - 1];

			if (startRes && endRes) {
				info.push({
					page: i,
					startResource: startRes.name,
					endResource: endRes.name,
				});
			}

			currentIndex += count;
		}
		return info;
	}, [isPaginated, totalPages, pageDistribution, allResources]);

	return {
		paginatedResources,
		currentPage,
		totalPages,
		goToPage,
		nextPage,
		prevPage,
		isPaginated,
		pageSize: pageDistribution[currentPage] ?? maxPerPage,
		totalResources,
		pageInfo,
	};
}
