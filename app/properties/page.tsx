// app/(public)/properties/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import { Heart, Mail, Phone, MessageSquare, MapPin } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

/** Types */
type ListingCategory = "buy" | "rent" | "offplan";

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
  city?: string | null;
}

interface PropertyRow {
  id: string;
  title: string;
  description?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  price: number;
  price_frequency?: "monthly" | "yearly" | "one-time" | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  type?: string | null;
  listing_category?: ListingCategory | null;
  image_urls?: string[] | string | null;
  company_id?: string | null;
  realtor_id?: string | null;
  completion_date?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
  // advanced
  amenities?: string[] | string | null;
  is_furnished?: boolean | null;
  video_360_url?: string | null;
  payment_plan?: any | null; // JSON stored
  distance_to_metro_km?: number | null;
  community_id?: string | null;
  community?: Community | null;
  realtor?: Realtor | null;
  company?: Company | null;
}

/** Helpers */
const parseImages = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (typeof v === "string") {
      return v.split(",").map((s) => s.trim()).filter(Boolean);
    }
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
    if (typeof v === "string") {
      return v.split(",").map((s) => s.trim()).filter(Boolean);
    }
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

/** Component */
export default function PropertyPage() {
  const { user } = useUser();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = PAGE_SIZE;

  // filters
  const [filterListingCategory, setFilterListingCategory] = useState<ListingCategory | "">("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterBedrooms, setFilterBedrooms] = useState<number | "">("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onlyOffplan, setOnlyOffplan] = useState(false);

  // advanced filters
  const [communities, setCommunities] = useState<Community[]>([])
  const [filterCommunity, setFilterCommunity] = useState<string | "">("")
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>("")
  const [filterAmenity, setFilterAmenity] = useState<string>("")
  const [filterPriceFrequency, setFilterPriceFrequency] = useState<string>("")

  // UI
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const listingRefs = useRef<HTMLButtonElement[]>([]);
  const typeRefs = useRef<HTMLButtonElement[]>([]);
  const [sliderListingPos, setSliderListingPos] = useState({ width: 0, left: 0 });
  const [sliderTypePos, setSliderTypePos] = useState({ width: 0, left: 0 });

  const propertyType = ["Apartment", "Villa", "Townhouse", "Office"];
  const amenitiesMaster = ['Parking','Pool','Gym','Balcony','Pet Friendly','Maids Room','Concierge','Security']

  // fetch community list (optional)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data } = await supabase.from('communities').select('id, name').order('name')
        if (!mounted) return
        setCommunities(data ?? [])
      } catch (err) {
        console.warn('communities fetch failed', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // fetch saved
  const fetchSaved = useCallback(async () => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user.id);
      if (error) throw error;
      const ids = (data || []).map((r: any) => r.property_id);
      setSavedIds(ids);
    } catch (err) {
      console.error("fetchSaved", err);
    }
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  // fetch properties with filters and attach realtor/company/community
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

        let query = supabase
          .from("properties")
          .select('*', { count: "estimated" })
          .order("created_at", { ascending: false })
          .range((currentPage - 1) * perPage, currentPage * perPage - 1);

        // server side filters
        if (filterListingCategory) query = query.eq("listing_category", filterListingCategory);
        if (filterType) query = query.eq("type", filterType);
        if (filterBedrooms) query = query.gte("bedrooms", filterBedrooms);
        if (minPrice !== "") query = query.gte("price", Number(minPrice));
        if (maxPrice !== "") query = query.lte("price", Number(maxPrice));
        if (onlyOffplan) query = query.eq("listing_category", "offplan");
        if (filterCommunity) query = query.eq("community_id", filterCommunity);
        if (filterPriceFrequency) query = query.eq("price_frequency", filterPriceFrequency);

        // fetch
        const res = await query;
        const { data, error, count } = res;
        if (error) throw error;

        const rows = (data || []) as PropertyRow[];

        // collect owner ids
        const realtorIds = Array.from(new Set(rows.filter((r) => r.realtor_id).map((r) => r.realtor_id!)));
        const companyIds = Array.from(new Set(rows.filter((r) => r.company_id).map((r) => r.company_id!)));
        const communityIds = Array.from(new Set(rows.filter((r) => r.community_id).map((r) => r.community_id!)));

        const realtorMap: Record<string, Realtor> = {};
        const companyMap: Record<string, Company> = {};
        const communityMap: Record<string, Community> = {};

        if (realtorIds.length > 0) {
          const { data: rdata, error: rerr } = await supabase
            .from("realtors")
            .select("id, full_name, company_name, phone_number, profile_pic, address")
            .in("id", realtorIds);
          if (rerr) console.warn("realtors fetch warning", rerr);
          (rdata || []).forEach((r: any) => {
            realtorMap[r.id] = r;
          });
        }

        if (companyIds.length > 0) {
          const { data: cdata, error: cerr } = await supabase
            .from("companies")
            .select("id, name, contact_email, phone, address, profile_pic, website")
            .in("id", companyIds);
          if (cerr) console.warn("companies fetch warning", cerr);
          (cdata || []).forEach((c: any) => {
            companyMap[c.id] = c;
          });
        }

        if (communityIds.length > 0) {
          const { data: comData, error: comErr } = await supabase
            .from("communities")
            .select("id, name")
            .in("id", communityIds);
          if (comErr) console.warn("communities fetch warning", comErr);
          (comData || []).forEach((c: any) => {
            communityMap[c.id] = c;
          });
        }

        // client-side amenity / neighborhood filter (because amenity array, neighborhood text)
        let rowsWithOwners = rows.map((r) => ({
          ...r,
          realtor: r.realtor_id ? realtorMap[r.realtor_id] ?? null : null,
          company: r.company_id ? companyMap[r.company_id] ?? null : null,
          community: r.community_id ? communityMap[r.community_id] ?? null : null,
        }));

        // apply client-side amenity + neighborhood filtering
        if (filterAmenity) {
          rowsWithOwners = rowsWithOwners.filter((p) => {
            const amenities = parseAmenities(p.amenities);
            return amenities.map(a => a.toLowerCase()).includes(filterAmenity.toLowerCase());
          });
        }

        if (filterNeighborhood) {
          rowsWithOwners = rowsWithOwners.filter((p) => (p.neighborhood || '').toLowerCase().includes(filterNeighborhood.toLowerCase()));
        }

        if (shouldReset) setProperties(rowsWithOwners);
        else {
          if (currentPage === 1) setProperties(rowsWithOwners);
          else setProperties((prev) => [...prev, ...rowsWithOwners]);
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
    [filterListingCategory, filterType, filterBedrooms, minPrice, maxPrice, onlyOffplan, page, filterCommunity, filterAmenity, filterNeighborhood, filterPriceFrequency]
  );

  // initial load + when filters change
  useEffect(() => {
    setPage(1);
    fetchProperties({ reset: true, page: 1 });
  }, [filterListingCategory, filterType, filterBedrooms, minPrice, maxPrice, onlyOffplan, filterCommunity, filterAmenity, filterNeighborhood, filterPriceFrequency, fetchProperties]);

  const loadMore = async () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    await fetchProperties({ page: next });
  };

  // slider helper
  const updateSlider = (refs: React.MutableRefObject<HTMLButtonElement[]>, setter: any, activeValue: string | "") => {
    if (!activeValue) { setter({ width: 0, left: 0 }); return; }
    const index = refs.current.findIndex((b) => b?.dataset?.value === activeValue);
    if (index === -1) { setter({ width: 0, left: 0 }); return; }
    const btn = refs.current[index];
    if (!btn) { setter({ width: 0, left: 0 }); return; }
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

  const applyPriceFilter = async () => {
    setPage(1);
    await fetchProperties({ reset: true, page: 1 });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative h-[420px]">
        <div className="absolute inset-0">
          <img src="/assets/images/burj2.jpg" alt="Hero" className="w-full h-full object-cover brightness-[0.65]" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-5xl font-bold text-[#1836b2]">Find Your Dream Property in UAE</h1>
          <p className="text-lg mt-2 max-w-2xl">Verified listings, developer projects, and smart filters.</p>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">

          {/* Row 1: listing category */}
          <div className="relative overflow-x-auto bg-gray-100 p-2 rounded-full">
            <motion.div className="absolute top-2 bottom-2 bg-[#1836b2] rounded-full"
              animate={{ width: sliderListingPos.width, left: sliderListingPos.left }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            <div className="flex gap-4 relative z-10 whitespace-nowrap">
              {(['buy','rent','offplan'] as ListingCategory[]).map((c, i) => (
                <button key={c} data-value={c} ref={(el) => { if (el) listingRefs.current[i] = el!; }}
                  onClick={() => { setFilterListingCategory((prev) => (prev === c ? "" : c)); }}
                  className={clsx("px-6 py-2 rounded-full font-semibold transition", filterListingCategory === c ? "text-white" : "text-gray-700")}>
                  {c.toUpperCase()}
                </button>
              ))}
              <div className="ml-4 flex items-center gap-3">
                <button onClick={() => {
                  setFilterListingCategory(""); setFilterType(""); setFilterBedrooms(""); setMinPrice(""); setMaxPrice(""); setFilterCommunity(""); setFilterAmenity(""); setFilterNeighborhood(""); setFilterPriceFrequency("");
                }} className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-sm">Clear filters</button>
              </div>
            </div>
          </div>

          {/* Row 2: type, bedrooms, price, community, amenity */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative overflow-x-auto bg-gray-100 p-2 rounded-full flex gap-4">
              <motion.div className="absolute top-2 bottom-2 bg-[#1836b2] rounded-full"
                animate={{ width: sliderTypePos.width, left: sliderTypePos.left }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              <div className="flex gap-4 relative z-10">
                {propertyType.map((t, i) => (
                  <button key={t} data-value={t} ref={(el) => { if (el) typeRefs.current[i] = el!; }}
                    onClick={() => setFilterType((prev) => (prev === t ? "" : t))}
                    className={clsx("px-4 py-2 rounded-full font-semibold whitespace-nowrap transition", filterType === t ? "text-white" : "text-gray-700")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div className="flex gap-2">
              <label className="hidden md:block text-sm text-gray-600 self-center">Bedrooms</label>
              {[1,2,3,4,5].map((b) => (
                <button key={b} onClick={() => setFilterBedrooms((prev) => (prev === b ? "" : b))}
                  className={clsx("px-3 py-2 rounded-full border text-sm", filterBedrooms === b ? "bg-[#1836b2] text-white" : "bg-white text-gray-700")}>
                  {b}+
                </button>
              ))}
            </div>

            {/* Community */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-600">Community</label>
              <select value={filterCommunity} onChange={(e) => setFilterCommunity(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">All</option>
                {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <label className="text-sm text-gray-600">Amenity</label>
              <select value={filterAmenity} onChange={(e) => setFilterAmenity(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">Any</option>
                {amenitiesMaster.map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              <label className="text-sm text-gray-600">Price Freq</label>
              <select value={filterPriceFrequency} onChange={(e) => setFilterPriceFrequency(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">Any</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>

            {/* Price inputs */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="text-sm text-gray-600">Min Price</div>
              <input type="number" placeholder="0" value={minPrice as any} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-24 px-3 py-2 border rounded-md" />
              <div className="text-sm text-gray-600">Max Price</div>
              <input type="number" placeholder="Any" value={maxPrice as any} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-24 px-3 py-2 border rounded-md" />
              <button onClick={applyPriceFilter} className="ml-3 px-3 py-2 rounded-md bg-[#1836b2] text-white">Apply</button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-72 rounded-lg" />)
            : properties.length === 0 && !loading ? <div className="col-span-full text-center py-16 text-gray-600">No properties found.</div>
            : properties.map((p) => {
              const imgs = parseImages(p.image_urls);
              const first = imgs[0] ?? null;
              const saved = savedIds.includes(p.id);

              const realtor = p.realtor ?? null;
              const company = p.company ?? null;
              const communityName = p.community?.name ?? '';

              const realtorName = realtor?.full_name ?? realtor?.company_name ?? "";
              const companyName = company?.name ?? "";

              const realtorPhone = realtor?.phone_number ?? "";
              const companyPhone = company?.phone ?? "";

              const waRealtor = sanitizePhone(realtorPhone);
              const waCompany = sanitizePhone(companyPhone);

              const excerpt = p.description ? (p.description.length > 120 ? p.description.slice(0,120) + "..." : p.description) : "";

              const amenities = parseAmenities(p.amenities);

              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                  <button onClick={() => {
                    // toggle save
                    if (!user) { alert('Please sign in to save properties.'); return; }
                    (async () => {
                      try {
                        if (saved) {
                          await supabase.from('saved_properties').delete().eq('user_id', user!.id).eq('property_id', p.id)
                          setSavedIds(s => s.filter(id => id !== p.id))
                        } else {
                          await supabase.from('saved_properties').insert({ user_id: user!.id, property_id: p.id })
                          setSavedIds(s => [...s, p.id])
                        }
                      } catch (err) { console.error(err) }
                    })()
                  }} className="absolute right-3 top-3 z-20 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition" title="Save property">
                    <Heart className={saved ? "text-[#D64B6E]" : "text-gray-500"} />
                  </button>

                  <div className="relative w-full h-44">
                    {first ? <Image src={first} alt={p.title} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{p.title}</h3>
                        <p className="text-sm text-gray-500">{p.address}{communityName ? ` — ${communityName}` : ''}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-[#1836b2] font-semibold">AED {p.price?.toLocaleString?.() ?? p.price}</div>
                        {p.price_frequency && <div className="text-xs text-gray-600">{p.price_frequency}</div>}
                        {p.payment_plan?.has_plan && <div className="text-xs text-green-700 mt-1">Payment Plan Available</div>}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700">{excerpt}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">{p.bedrooms ?? "—"} Beds • {p.type ?? "—"}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {p.is_furnished ? 'Furnished' : 'Unfurnished'} • {p.distance_to_metro_km ? `${p.distance_to_metro_km} km to metro` : '—'}
                        </div>

                        {amenities.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {amenities.slice(0,5).map(a => <span key={a} className="text-xs px-2 py-1 rounded bg-gray-100">{a}</span>)}
                            {amenities.length > 5 && <span className="text-xs px-2 py-1 rounded bg-gray-100">+{amenities.length - 5} more</span>}
                          </div>
                        )}

                        {p.listing_category === "offplan" && p.completion_date && (
                          <div className="text-xs text-gray-500 mt-1">Handover: {new Date(p.completion_date).toLocaleDateString()}</div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <a href={`/properties/${p.id}`} className="bg-[#1836b2] text-white px-3 py-2 rounded-md">View</a>

                        <div className="flex gap-2 mt-2">
                          {realtorPhone ? <a href={`tel:${realtorPhone}`} className="p-2 rounded bg-gray-100 hover:bg-gray-200"><Phone size={16} /></a> : null}
                          {waRealtor ? <a href={`https://wa.me/${waRealtor}`} target="_blank" rel="noreferrer" className="p-2 rounded bg-gray-100 hover:bg-gray-200"><MessageSquare size={16} /></a> : null}
                          {p.video_360_url ? <a href={p.video_360_url} target="_blank" rel="noreferrer" className="p-2 rounded bg-gray-100 hover:bg-gray-200"><MapPin size={16} /></a> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-8">
          {loadingMore ? <div className="px-6 py-3 bg-gray-100 rounded-md">Loading...</div> : hasMore ? <button onClick={loadMore} className="px-6 py-3 bg-[#1836b2] text-white rounded-md hover:bg-[#112b8d]">Load more</button> : <div className="text-gray-500">No more properties</div>}
        </div>
      </main>

      <Footer />
    </div>
  );
}