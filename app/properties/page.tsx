"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import { Heart, Mail, Phone, MessageSquare, MapPin, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import FooterStickyButtons from "@/components/FooterStickyBottons";
import  Blog  from "@/components/Blog"


/**
 * Advanced Property Listing Page (Bayut-style hybrid)
 *
 * - Sticky search bar under hero
 * - Desktop side filters, mobile collapsible filters
 * - Community modal: emirates list + searchable neighborhoods from Supabase
 * - Full list of Bayut property types + icons
 * - Many filters: beds, price, size, furnishing, amenities, developer, completion year, ready/offplan, sort
 * - Server-side supabase query built from filters + pagination
 */

/** -----------------------
 * Types
 * ------------------------*/
type ListingCategory = "buy" | "rent" | "offplan";
type PropertyType =
  | "Apartment"
  | "Villa"
  | "Townhouse"
  | "Penthouse"
  | "Duplex"
  | "Hotel Apartment"
  | "Warehouse"
  | "Office"
  | "Shop"
  | "Land"
  | "Studio";

interface Realtor {
  id: string;
  full_name?: string | null;
  company_name?: string | null;
  phone_number?: string | null;
  profile_pic?: string | null;
  address?: string | null;
}

interface Company {
  id: string;
  name?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  profile_pic?: string | null;
  website?: string | null;
}

interface Community {
  id: string;
  name: string;
  emirate: string;
}

interface Neighborhood {
  id: string;
  name: string;
  emirate: string;
  community_id?: string | null;
}

interface PropertyRow {
  id: string;
  title: string;
  description?: string | null;
  address?: string | null;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  type?: string | null;
  listing_category?: ListingCategory | null;
  image_urls?: string[] | string | null;
  company_id?: string | null;
  realtor_id?: string | null;
  completion_date?: string | null;
  completion_year?: number | null;
  is_furnished?: boolean | null;
  is_verified?: boolean | null;
  amenities?: string[] | string | null;
  developer_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
  // attached after batch fetch
  realtor?: Realtor | null;
  company?: Company | null;
  developer?: { id: string; name?: string } | null;
  community?: Community | null;
  neighborhood?: Neighborhood | null;
}

/** -----------------------
 * Helpers
 * ------------------------*/
const parseImages = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  }
};

const parseAmenities = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  }
};

const sanitizePhone = (raw?: string | null) => {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits;
};

const PAGE_SIZE = 12;

/** -----------------------
 * Property type icons map (simple emoji + fallback)
 * ------------------------*/
const typeIconMap: Record<PropertyType | string, React.ReactNode> = {
  Apartment: <span className="text-2xl">🏢</span>,
  Villa: <span className="text-2xl">🏠</span>,
  Townhouse: <span className="text-2xl">🏘</span>,
  "Penthouse": <span className="text-2xl">🌆</span>,
  Duplex: <span className="text-2xl">🔁</span>,
  "Hotel Apartment": <span className="text-2xl">🛎</span>,
  Warehouse: <span className="text-2xl">🏭</span>,
  Office: <span className="text-2xl">🏢</span>,
  Shop: <span className="text-2xl">🏬</span>,
  Land: <span className="text-2xl">⛰</span>,
  Studio: <span className="text-2xl">🎬</span>,
};

/** -----------------------
 * Emirates list (confirming your choice)
 * ------------------------*/
const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

/** -----------------------
 * Component
 * ------------------------*/
export default function PropertyPage() {
  const { user } = useUser();
  // data
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = PAGE_SIZE;

  // filters (all)
  const [keyword, setKeyword] = useState("");
  const [filterListingCategory, setFilterListingCategory] = useState<ListingCategory | "">("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterBedrooms, setFilterBedrooms] = useState<number | "">("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [priceFrequency, setPriceFrequency] = useState<string>("");
  const [filterPriceFrequency, setFilterPriceFrequency] = useState<string>("")

  const [minSize, setMinSize] = useState<number | "">("");
  const [maxSize, setMaxSize] = useState<number | "">("");
  const [filterFurnished, setFilterFurnished] = useState<"any" | "furnished" | "unfurnished">("any");
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [showFiltersDesktop, setShowFiltersDesktop] = useState(true);
  const [filterDeveloper, setFilterDeveloper] = useState<string | "">("");
  const [filterCompletionYear, setFilterCompletionYear] = useState<number | "">("");
  const [onlyOffplan, setOnlyOffplan] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "size_desc">("newest");

  // community / neighborhood selection
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [selectedEmirate, setSelectedEmirate] = useState<string | "">("");
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | "">("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | "">("");

  // UI
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // lookup data
  const [communities, setCommunities] = useState<Community[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [developers, setDevelopers] = useState<{ id: string; name?: string }[]>([]);
  const [amenitiesMaster, setAmenitiesMaster] = useState<string[]>([
    "Parking",
    "Pool",
    "Gym",
    "Balcony",
    "Pet Friendly",
    "Maids Room",
    "Concierge",
    "Security",
    "Elevator",
    "AC",
  ]);

  // property types (Bayut list)
  const propertyTypeList: PropertyType[] = [
    "Apartment",
    "Villa",
    "Townhouse",
    "Penthouse",
    "Duplex",
    "Hotel Apartment",
    "Warehouse",
    "Office",
    "Shop",
    "Land",
    "Studio",
  ];

  // slider highlight refs (optional)
  const listingRefs = useRef<HTMLButtonElement[]>([]);
  const typeRefs = useRef<HTMLButtonElement[]>([]);
  const [sliderListingPos, setSliderListingPos] = useState({ width: 0, left: 0 });
  const [sliderTypePos, setSliderTypePos] = useState({ width: 0, left: 0 });

  // fetch devs, communities, neighborhoods for filters
  useEffect(() => {
    let mounted = true;
    const loadLookups = async () => {
      try {
        const [comRes, neighRes, devRes] = await Promise.all([
          supabase.from("communities").select("id, name, emirate").order("name"),
          supabase.from("neighborhoods").select("id, name, emirate, community_id").order("name"),
          supabase.from("developers").select("id, name"),
        ]);
        if (!mounted) return;
        setCommunities(comRes.data ?? []);
        setNeighborhoods(neighRes.data ?? []);
        setDevelopers(devRes.data ?? []);
      } catch (err) {
        console.warn("lookup load error", err);
      }
    };
    loadLookups();
    return () => {
      mounted = false;
    };
  }, []);

  // fetch saved properties (for signed users)
  const fetchSaved = useCallback(async () => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("saved_properties")
        .select("property_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setSavedIds((data || []).map((r: any) => r.property_id));
    } catch (err) {
      console.error("fetchSaved", err);
    }
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  // toggle save
  const toggleSave = async (propertyId: string) => {
    if (!user) {
      alert("Please sign in to save properties.");
      return;
    }
    try {
      if (savedIds.includes(propertyId)) {
        await supabase.from("saved_properties").delete().eq("user_id", user.id).eq("property_id", propertyId);
        setSavedIds((s) => s.filter((id) => id !== propertyId));
      } else {
        await supabase.from("saved_properties").insert({ user_id: user.id, property_id: propertyId });
        setSavedIds((s) => [...s, propertyId]);
      }
    } catch (err) {
      console.error("toggleSave", err);
    }
  };

  // build and execute supabase query with filters & pagination
  const fetchProperties = useCallback(
    async (opts?: { reset?: boolean; page?: number }) => {
      const currentPage = opts?.page ?? page;
      const shouldReset = opts?.reset ?? false;
      try {
        if (shouldReset) {
          setLoading(true);
          setPage(1);
        } else if (currentPage === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setErrorMsg(null);

        // base query
        let query = supabase
          .from("properties")
          .select("*", { count: "estimated" })
          .order(sortBy === "newest" ? "created_at" : sortBy === "price_asc" ? "price" : sortBy === "price_desc" ? "price" : "size", { ascending: sortBy === "price_asc" })
          .range((currentPage - 1) * perPage, currentPage * perPage - 1);

        // keyword: search title or description or address (simple ilike)
        if (keyword) {
          // Supabase OR ilike - safe approach: use .or with ilike columns
          const like = `%${keyword}%;`
          query = query.or(`title.ilike.${like},description.ilike.${like},address.ilike.${like}`);
        }

        // listing category
        if (filterListingCategory) query = query.eq("listing_category", filterListingCategory);

        // type
        if (filterType) {
          // some schemas have 'type' or 'property_type' — try both using or
          query = query.or(`type.eq.${filterType},property_type.eq.${filterType}`);
        }

        if (filterBedrooms) query = query.gte("bedrooms", filterBedrooms);
        if (minPrice !== "") query = query.gte("price", Number(minPrice));
        if (maxPrice !== "") query = query.lte("price", Number(maxPrice));
        if (priceFrequency) {
           query = query.eq("price_frequency", priceFrequency);
            }

        if (minSize !== "") query = query.gte("size", Number(minSize));
        if (maxSize !== "") query = query.lte("size", Number(maxSize));
        if (filterFurnished === "furnished") query = query.eq("is_furnished", true);
        if (filterFurnished === "unfurnished") query = query.eq("is_furnished", false);
        if (filterDeveloper) query = query.eq("developer_id", filterDeveloper);
        if (filterCompletionYear) query = query.eq("completion_year", filterCompletionYear);
        if (onlyOffplan) query = query.eq("listing_category", "offplan");
        // community/neighborhood
        if (selectedCommunityId) query = query.eq("community_id", selectedCommunityId);
        if (selectedNeighborhoodId) query = query.eq("neighborhood_id", selectedNeighborhoodId);

        // amenities: stored as array or CSV — we do ilike checks (best-effort)
        if (filterAmenities.length > 0) {
          // combine as OR ilike checks (not ideal for arrays but works for CSV/JSON text)
          const orStr = filterAmenities.map(a => `amenities.ilike.%25${a}%25).join(",");
          query = query.or(orStr`);
        }

        const res = await query;
        const { data, error, count } = res;
        if (error) throw error;

        const rows = (data || []) as PropertyRow[];

        // batch load owners & developers & communities & neighborhoods to attach
        const realtorIds = Array.from(new Set(rows.filter(r => r.realtor_id).map(r => r.realtor_id!)));
        const companyIds = Array.from(new Set(rows.filter(r => r.company_id).map(r => r.company_id!)));
        const developerIds = Array.from(new Set(rows.filter(r => r.developer_id).map(r => r.developer_id!)));
        const communityIds = Array.from(new Set(rows.filter(r => (r as any).community_id).map(r => (r as any).community_id!)));
        const neighborhoodIds = Array.from(new Set(rows.filter(r => (r as any).neighborhood_id).map(r => (r as any).neighborhood_id!)));

        const [rdata, cdata, ddata, communityData, neighborhoodData] = await Promise.all([
          realtorIds.length ? supabase.from("realtors").select("id, full_name, company_name, phone_number, profile_pic, address").in("id", realtorIds) : Promise.resolve({ data: [] }),
          companyIds.length ? supabase.from("companies").select("id, name, contact_email, phone, profile_pic, website").in("id", companyIds) : Promise.resolve({ data: [] }),
          developerIds.length ? supabase.from("developers").select("id, name").in("id", developerIds) : Promise.resolve({ data: [] }),
          communityIds.length ? supabase.from("communities").select("id, name, emirate").in("id", communityIds) : Promise.resolve({ data: [] }),
          neighborhoodIds.length ? supabase.from("neighborhoods").select("id, name, emirate, community_id").in("id", neighborhoodIds) : Promise.resolve({ data: [] }),
        ]);

        const realtorMap: Record<string, Realtor> = {};
        const companyMap: Record<string, Company> = {};
        const devMap: Record<string, { id: string; name?: string }> = {};
        const communityMap: Record<string, Community> = {};
        const neighborhoodMap: Record<string, Neighborhood> = {};

        (rdata?.data || []).forEach((r: any) => (realtorMap[r.id] = r));
        (cdata?.data || []).forEach((c: any) => (companyMap[c.id] = c));
        (ddata?.data || []).forEach((d: any) => (devMap[d.id] = d));
        (communityData?.data || []).forEach((c: any) => (communityMap[c.id] = c));
        (neighborhoodData?.data || []).forEach((n: any) => (neighborhoodMap[n.id] = n));

        const rowsWithOwners = rows.map(r => ({
          ...r,
          realtor: r.realtor_id ? realtorMap[r.realtor_id] ?? null : null,
          company: r.company_id ? companyMap[r.company_id] ?? null : null,
          developer: r.developer_id ? devMap[r.developer_id] ?? null : null,
          community: (r as any).community_id ? communityMap[(r as any).community_id] ?? null : null,
          neighborhood: (r as any).neighborhood_id ? neighborhoodMap[(r as any).neighborhood_id] ?? null : null,
        }));

        if (shouldReset) setProperties(rowsWithOwners);
        else {
          if (currentPage === 1) setProperties(rowsWithOwners);
          else setProperties(prev => [...prev, ...rowsWithOwners]);
        }

        if (typeof count === "number") {
          const totalFetched = (currentPage - 1) * perPage + rows.length;
          setHasMore(totalFetched < count);
        } else {
          setHasMore(rows.length === perPage);
        }
      } catch (err: any) {
        console.error("fetchProperties error", err);
        setErrorMsg(err?.message ?? "Failed to load properties");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      page,
      perPage,
      keyword,
      filterListingCategory,
      filterType,
      filterBedrooms,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      filterFurnished,
      filterAmenities,
      filterDeveloper,
      filterCompletionYear,
      onlyOffplan,
      selectedCommunityId,
      selectedNeighborhoodId,
      sortBy,
    ]
  );

  // initial load + when filters change reset to first page
  useEffect(() => {
    setPage(1);
    fetchProperties({ reset: true, page: 1 });
  }, [
    keyword,
    filterListingCategory,
    filterType,
    filterBedrooms,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    filterFurnished,
    filterAmenities,
    filterDeveloper,
    filterCompletionYear,
    onlyOffplan,
    selectedCommunityId,
    selectedNeighborhoodId,
    sortBy,
    fetchProperties,
  ]);

  // load more
  const loadMore = async () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    await fetchProperties({ page: next });
  };

  // slider helpers for the top chips
  const updateSlider = (refs: React.MutableRefObject<HTMLButtonElement[]>, setter: any, activeValue: string | "") => {
    if (!activeValue) {
      setter({ width: 0, left: 0 });
      return;
    }
    const index = refs.current.findIndex(b => b?.dataset?.value === activeValue);
    if (index === -1) {
      setter({ width: 0, left: 0 });
      return;
    }
    const btn = refs.current[index];
    if (!btn) {
      setter({ width: 0, left: 0 });
      return;
    }
    setter({ width: btn.offsetWidth, left: btn.offsetLeft });
  };

  useEffect(() => {
    updateSlider(listingRefs, setSliderListingPos, filterListingCategory);
    const onResize = () => updateSlider(listingRefs, setSliderListingPos, filterListingCategory);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [filterListingCategory]);

  useEffect(() => {
    updateSlider(typeRefs, setSliderTypePos, filterType);
    const onResize = () => updateSlider(typeRefs, setSliderTypePos, filterType);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [filterType]);

  // community modal helpers
  const openCommunityModal = () => {
    setCommunityModalOpen(true);
    setSelectedEmirate("");
    setNeighborhoodSearch("");
  };

  const closeCommunityModal = () => setCommunityModalOpen(false);

  const selectCommunity = (id: string) => {
    setSelectedCommunityId(id);
    setSelectedNeighborhoodId("");
    setCommunityModalOpen(false);
  };

  const selectNeighborhood = (id: string) => {
    setSelectedNeighborhoodId(id);
    setCommunityModalOpen(false);
  };

  // neighborhood list filtered by selected emirate & search
  const filteredNeighborhoods = neighborhoods.filter(n => {
    if (!selectedEmirate) return true;
    if (n.emirate !== selectedEmirate) return false;
    if (!neighborhoodSearch) return true;
    return n.name.toLowerCase().includes(neighborhoodSearch.toLowerCase());
  });

  // small image carousel per property
  function PropertyImageCarousel({ imgs }: { imgs: string[] }) {
    const [idx, setIdx] = useState(0);
    if (!imgs || imgs.length === 0) return <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>;
    const show = imgs[Math.min(idx, imgs.length - 1)];
    return (
      <div className="relative w-full h-44 overflow-hidden bg-gray-100">
        <Image src={show} alt="property" fill style={{ objectFit: "cover" }} />
        {imgs.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow">
              <ChevronRight size={16} />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-1">
              {imgs.map((_, i) => (
                <div key={i} className={clsx("w-8 h-1 rounded", i === idx ? "bg-white" : "bg-white/40")} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img src="/assets/images/burj2.jpg" alt="Hero" className="w-full h-full object-cover brightness-[0.65]" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1836b2] drop-shadow" >
            Dubai’s Smartest Real Estate Marketplace
          </h1>
           <h1 className="text-5xl mt-5 mb-5 font-bold text-[#302cfc]">Find Your Dream Property in UAE</h1>
          <p className="mt-2 text-lg md:text-xl max-w-3xl">
            Buy, Sell & Rent Property With Confidence  curated listings, verified partners, and smart filters.
          </p>
        </div>
      </section>

      {/* STICKY SEARCH BAR (below hero) */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
          {/* Row 1: category chips */}
          <div className="relative overflow-x-auto bg-gray-100 p-2 rounded-full">
            <motion.div
              className="absolute top-2 bottom-2 bg-[#1836b2] rounded-full"
              animate={{ width: sliderListingPos.width, left: sliderListingPos.left }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="flex gap-4 relative z-10 whitespace-nowrap items-center">
              {(["buy", "rent", "offplan"] as ListingCategory[]).map((c, i) => (
                <button
                  key={c}
                  data-value={c}
                  ref={(el) => { if (el) listingRefs.current[i] = el; }}
                  onClick={() => {
                    setFilterListingCategory(prev => prev === c ? "" : c);
                    setOnlyOffplan(c === "offplan");
                  }}
                  className={clsx("px-5 py-2 rounded-full font-semibold transition", filterListingCategory === c ? "text-white" : "text-gray-700")}
                >
                  {c.toUpperCase()}
                </button>
              ))}
              <div className="ml-4 flex items-center gap-3">
                <button onClick={() => {
                  setFilterListingCategory("");
                  setOnlyOffplan(false);
                  setFilterType("");
                  setFilterBedrooms("");
                  setMinPrice("");
                  setMaxPrice("");
                  setMinSize("");
                  setMaxSize("");
                  setFilterFurnished("any");
                  setFilterAmenities([]);
                  setFilterDeveloper("");
                  setSelectedCommunityId("");
                  setSelectedNeighborhoodId("");
                }} className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-sm">Clear filters</button>
              </div>
            </div>
          </div>

          {/* Row 2: sticky search inputs */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Keyword / Search */}
            <div className="flex items-center gap-2 flex-1">
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search by title, address or keyword e.g. 'jumeirah' " className="w-full px-4 py-3 border rounded-md" />
            </div>

            {/* Community selection (modal trigger) */}
            <div>
              <button onClick={openCommunityModal} className="px-4 py-3 border rounded-md flex items-center gap-2">
                <MapPin /> {selectedNeighborhoodId ? neighborhoods.find(n => n.id === selectedNeighborhoodId)?.name
                  : selectedCommunityId ? communities.find(c => c.id === selectedCommunityId)?.name
                  : "All Communities"}
              </button>
            </div>

            {/* Type select quick */}
            <div className="hidden md:block">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-3 border rounded-md">
                <option value="">Any Type</option>
                {propertyTypeList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Bedrooms small */}
            <div className="hidden md:block">
              <select value={filterBedrooms as any} onChange={(e) => setFilterBedrooms(e.target.value === "" ? "" : Number(e.target.value))} className="px-3 py-3 border rounded-md">
                <option value="">Beds</option>
                {[1,2,3,4,5,6].map(b => <option key={b} value={b}>{b}+</option>)}
              </select>
            </div>

          <div>
            
              <select value={filterPriceFrequency} onChange={(e) => setFilterPriceFrequency(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">Any Price</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            
          </div>

            {/* Sort */}
            <div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-3 border rounded-md">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="size_desc">Size: Large → Small</option>
              </select>
            </div>

            {/* Mobile filters toggle */}
            <div className="md:hidden">
              <button onClick={() => setShowFiltersMobile(v => !v)} className="px-4 py-3 bg-[#1836b2] text-white rounded-md">Filters</button>
            </div>

            {/* Apply (desktop) */}
            <div className="hidden md:block">
              <button onClick={() => { setPage(1); fetchProperties({ reset: true, page: 1 }); }} className="px-4 py-3 bg-[#302cfc] text-white rounded-md">Search</button>
            </div>
          </div>

          {/* Mobile collapsible filters */}
          {showFiltersMobile && (
            <div className="md:hidden mt-3 p-3 border rounded-md space-y-2 bg-white">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min price" value={minPrice as any} onChange={(e)=>setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} className="px-3 py-2 border rounded" />
                <input type="number" placeholder="Max price" value={maxPrice as any} onChange={(e)=>setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} className="px-3 py-2 border rounded" />
                <input type="number" placeholder="Min size" value={minSize as any} onChange={(e)=>setMinSize(e.target.value === "" ? "" : Number(e.target.value))} className="px-3 py-2 border rounded" />
                <input type="number" placeholder="Max size" value={maxSize as any} onChange={(e)=>setMaxSize(e.target.value === "" ? "" : Number(e.target.value))} className="px-3 py-2 border rounded" />
              </div>

              <div className="flex gap-2 mt-2">
                <select value={filterFurnished} onChange={(e)=>setFilterFurnished(e.target.value as any)} className="px-3 py-2 border rounded w-full">
                  <option value="any">Any Furnishing</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
                <select value={filterDeveloper} onChange={(e)=>setFilterDeveloper(e.target.value)} className="px-3 py-2 border rounded w-full">
                  <option value="">Any Developer</option>
                  {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button onClick={() => { setPage(1); fetchProperties({ reset: true, page: 1 }); setShowFiltersMobile(false); }} className="px-4 py-2 bg-[#302cfc] text-white rounded-md w-full">Apply</button>
                <button onClick={() => setShowFiltersMobile(false)} className="px-4 py-2 border rounded-md w-full">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* Desktop filter toggle button */}
        <div className="hidden lg:block mb-4">
        <button
         onClick={() => setShowFiltersDesktop(v => !v)}
         className="px-4 py-2 border rounded-md bg-white shadow-sm"
          >
         {showFiltersDesktop ? "Hide Filters" : "Show Filters"}
         </button>
         </div>

         <AnimatePresence mode="wait">
         {showFiltersDesktop && (
  <motion.aside
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
    className="hidden lg:block w-72 sticky top-28 self-start"
  >
        {/* LEFT: Filters (desktop) */}
        <aside className="hidden lg:block w-72 sticky top-28 self-start">
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Price (AED)</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice as any} onChange={(e)=>setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-1/2 px-3 py-2 border rounded" />
                <input type="number" placeholder="Max" value={maxPrice as any} onChange={(e)=>setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-1/2 px-3 py-2 border rounded" />
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Property Type</h4>
              <div className="grid grid-cols-2 gap-2">
                {propertyTypeList.map((t) => (
                  <button key={t} onClick={() => setFilterType(prev => prev === t ? "" : t)} className={clsx("px-2 py-2 rounded-md text-sm text-left flex items-center gap-2", filterType === t ? "bg-[#1836b2] text-white" : "bg-white")}>
                    <span>{typeIconMap[t]}</span>
                    <span className="truncate">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Bedrooms</h4>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(b => <button key={b} onClick={() => setFilterBedrooms(prev => prev === b ? "" : b)} className={clsx("px-3 py-2 rounded-md", filterBedrooms === b ? "bg-[#1836b2] text-white" : "bg-white")}>{b}+</button>)}
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Size (sq ft)</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minSize as any} onChange={(e)=>setMinSize(e.target.value === "" ? "" : Number(e.target.value))} className="w-1/2 px-3 py-2 border rounded" />
                <input type="number" placeholder="Max" value={maxSize as any} onChange={(e)=>setMaxSize(e.target.value === "" ? "" : Number(e.target.value))} className="w-1/2 px-3 py-2 border rounded" />
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Furnishing</h4>
              <div className="flex gap-2">
                <button onClick={() => setFilterFurnished("any")} className={clsx("px-3 py-2 rounded-md", filterFurnished === "any" ? "bg-[#1836b2] text-white" : "bg-white")}>Any</button>
                <button onClick={() => setFilterFurnished("furnished")} className={clsx("px-3 py-2 rounded-md", filterFurnished === "furnished" ? "bg-[#1836b2] text-white" : "bg-white")}>Furnished</button>
                <button onClick={() => setFilterFurnished("unfurnished")} className={clsx("px-3 py-2 rounded-md", filterFurnished === "unfurnished" ? "bg-[#1836b2] text-white" : "bg-white")}>Unfurnished</button>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {amenitiesMaster.map(a => {
                  const sel = filterAmenities.includes(a);
                  return (
                    <button key={a} onClick={() => setFilterAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])} className={clsx("px-3 py-1 rounded-full text-sm", sel ? "bg-[#1836b2] text-white" : "bg-white")}>
                      {a}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Developer</h4>
              <select value={filterDeveloper} onChange={(e)=>setFilterDeveloper(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="">Any Developer</option>
                {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Completion Year</h4>
              <input type="number" placeholder="e.g. 2025" value={filterCompletionYear as any} onChange={(e)=>setFilterCompletionYear(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="p-4 border rounded-md">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={onlyOffplan} onChange={(e) => setOnlyOffplan(e.target.checked)} />
                <span className="text-sm">Show only Off-plan</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setPage(1); fetchProperties({ reset: true, page: 1 }); }} className="w-1/2 px-3 py-2 bg-[#302cfc] text-white rounded-md">Apply</button>
              <button onClick={() => {
                setKeyword("");
                setFilterListingCategory(""); setFilterType(""); setFilterBedrooms(""); setMinPrice(""); setMaxPrice(""); setMinSize(""); setMaxSize("");
                setFilterFurnished("any"); setFilterAmenities([]); setFilterDeveloper(""); setFilterCompletionYear(""); setOnlyOffplan(false); setSelectedCommunityId(""); setSelectedNeighborhoodId("");
                setPage(1);
                fetchProperties({ reset: true, page: 1 });
              }} className="w-1/2 px-3 py-2 border rounded-md">Reset</button>
            </div>
          </div>
        </aside>

        </motion.aside>
         )}

      </AnimatePresence>

        {/* RIGHT: Results */}
        <section className="flex-1">
          {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-72 rounded-lg" />
                ))
              : properties.length === 0 && !loading
              ? <div className="col-span-full text-center py-16 text-gray-600">No properties found.</div>
              : properties.map((p) => {
                  const imgs = parseImages(p.image_urls);
                  const first = imgs[0] ?? null;
                  const saved = savedIds.includes(p.id);
                  const realtor = p.realtor ?? null;
                  const company = p.company ?? null;
                  const realtorName = realtor?.full_name ?? realtor?.company_name ?? "";
                  const companyName = company?.name ?? "";
                  const realtorPhone = realtor?.phone_number ?? "";
                  const companyPhone = company?.phone ?? "";
                  const realtorEmail = (realtor as any)?.email ?? null;
                  const companyEmail = company?.contact_email ?? null;
                  const waRealtor = sanitizePhone(realtorPhone);
                  const waCompany = sanitizePhone(companyPhone);
                  const excerpt = p.description ? (p.description.length > 120 ? p.description.slice(0, 120) + "..." : p.description) : "";
                  const displayType = p.type ?? "—";

                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                      <button onClick={() => toggleSave(p.id)} className="absolute right-3 top-3 z-20 bg-white/90 p-2 rounded-full shadow hover:scale-105 transition">
                        <Heart className={saved ? "text-[#D64B6E]" : "text-gray-500"} />
                      </button>

                      {/* Image carousel */}
                      <PropertyImageCarousel imgs={imgs.slice(0, 6)} />

                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{p.title}</h3>
                            <p className="text-sm text-gray-500">{p.address}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-[#1836b2] font-semibold">AED {p.price?.toLocaleString?.() ?? p.price}</div>
                            <div className="text-xs text-gray-500">{p.bedrooms ?? "—"} beds • {displayType}</div>
                            {p.is_verified && <div className="mt-1 text-xs text-green-600">Verified</div>}
                            {p.listing_category === "offplan" && <div className="mt-1 text-xs text-orange-500">Off-plan</div>}
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-gray-700">{excerpt}</p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {p.size ? `${p.size} sq ft • ` : ""}{p.bathrooms ?? "—"} baths
                          </div>

                          <div className="flex gap-2">
                            <a href={`/properties/${p.id}`} className="bg-[#1836b2] text-white px-3 py-2 rounded-md">View</a>

                            <div className="flex gap-1 items-center">
                              {realtorPhone ? <a href={`tel:${realtorPhone}`} className="p-2 rounded bg-gray-100 hover:bg-gray-200"><Phone size={16} /></a> : null}
                              {waRealtor ? <a href={`https://wa.me/${waRealtor}`} target="_blank" rel="noreferrer" className="p-2 rounded bg-gray-100 hover:bg-gray-200"><MessageSquare size={16} /></a> : null}
                              {realtorEmail ? <a href={`mailto:${realtorEmail}`} className="p-2 rounded bg-gray-100 hover:bg-gray-200"><Mail size={16} /></a> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-8">
            {loadingMore ? <div className="px-6 py-3 bg-gray-100 rounded-md">Loading...</div>
              : hasMore ? <button onClick={loadMore} className="px-6 py-3 bg-[#1836b2] text-white rounded-md hover:bg-[#112b8d]">Load more</button>
              : <div className="text-gray-500">No more properties</div>}
          </div>
        </section>
      </main>

      <FooterStickyButtons />
     

      {/* COMMUNITY / NEIGHBORHOOD MODAL */}
      {communityModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Choose Emirate & Neighborhood</h3>
              <button onClick={closeCommunityModal} className="px-3 py-1 border rounded">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Emirates</h4>
                <div className="grid grid-cols-2 gap-2">
                  {EMIRATES.map(e => (
                    <button key={e} onClick={() => setSelectedEmirate(prev => prev === e ? "" : e)} className={clsx("px-3 py-2 rounded-md text-left", selectedEmirate === e ? "bg-[#1836b2] text-white" : "bg-gray-100")}>
                      {e}
                    </button>
                  ))}
                </div>

                <h4 className="font-semibold mt-4 mb-2">Communities</h4>
                <div className="max-h-48 overflow-auto border rounded p-2">
                  <button onClick={() => { setSelectedCommunityId(""); setSelectedNeighborhoodId(""); }} className={clsx("w-full text-left px-2 py-1 rounded", selectedCommunityId === "" ? "bg-[#1836b2] text-white" : "")}>All Communities</button>
                  {communities.filter(c => (!selectedEmirate || c.emirate === selectedEmirate)).map(c => (
                    <button key={c.id} onClick={() => { setSelectedCommunityId(c.id); setSelectedNeighborhoodId(""); }} className={clsx("w-full text-left px-2 py-1 rounded mt-1", selectedCommunityId === c.id ? "bg-[#1836b2] text-white" : "hover:bg-gray-100")}>
                      {c.name} <span className="text-xs text-gray-400 ml-2">({c.emirate})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Search Neighborhoods{selectedEmirate ? ` in ${selectedEmirate}` : ""}</h4>
                <input value={neighborhoodSearch} onChange={(e) => setNeighborhoodSearch(e.target.value)} placeholder="Type neighborhood name..." className="w-full px-3 py-2 border rounded mb-2" />
                <div className="max-h-72 overflow-auto border rounded p-2">
                  {filteredNeighborhoods.length === 0 ? <div className="text-gray-500">No neighborhoods found.</div> : filteredNeighborhoods.map(n => (
                    <div key={n.id} className="flex items-center justify-between px-2 py-1">
                      <div>
                        <div className="font-medium">{n.name}</div>
                        <div className="text-xs text-gray-400">{n.emirate}</div>
                      </div>
                      <div>
                        <button onClick={() => selectNeighborhood(n.id)} className="px-3 py-1 bg-[#302cfc] text-white rounded">Select</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => { closeCommunityModal(); }} className="px-3 py-2 border rounded">Cancel</button>
                  <button onClick={() => { setPage(1); fetchProperties({ reset: true, page: 1 }); closeCommunityModal(); }} className="px-3 py-2 bg-[#1836b2] text-white rounded">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section>
        <Blog />
      </section>

        <footer className="w-full text-center py-4 text-sm text-gray-600 border-t bg-white mt-10">
      © {new Date().getFullYear()} SkyRealty. All rights reserved.
    </footer>
    </div>
  );
}