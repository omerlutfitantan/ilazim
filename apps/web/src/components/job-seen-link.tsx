"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { markListingSeenAction } from "@/actions";

export const JobSeenLink = forwardRef<
  HTMLAnchorElement,
  { listingId: string } & ComponentProps<typeof Link>
>(function JobSeenLink({ listingId, onClick, ...props }, ref) {
  return (
    <Link
      ref={ref}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        void markListingSeenAction(listingId);
      }}
    />
  );
});
