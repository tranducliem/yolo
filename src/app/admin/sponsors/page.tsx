"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Sponsor {
  id: string;
  company_name: string;
  budget: number;
  tag: string;
  target_age: string | null;
  target_gender: string | null;
  target_pet_type: string | null;
  target_region: string | null;
  budget_allocated: number;
  start_date: string;
  end_date: string;
  status: "active" | "scheduled" | "ended" | "draft";
  npo_id: string | null;
  post_count: number;
  impressions: number;
  donation_total: number;
  created_at: string;
}

interface NPO {
  id: string;
  name: string;
  region: string;
  target: string;
  allocation_ratio: number;
  total_donated: number;
}

const sponsorStatusColor: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  scheduled: "bg-blue-50 text-blue-600",
  ended: "bg-gray-100 text-gray-500",
  draft: "bg-yellow-50 text-yellow-600",
};

const sponsorStatusLabel: Record<string, string> = {
  active: "Active",
  scheduled: "Scheduled",
  ended: "Ended",
  draft: "Draft",
};

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [npos, setNpos] = useState<NPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formCompany, setFormCompany] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formAge, setFormAge] = useState("all");
  const [formGender, setFormGender] = useState("all");
  const [formPetType, setFormPetType] = useState("all");
  const [formRegion, setFormRegion] = useState("all");
  const [formAllocated, setFormAllocated] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formNpo, setFormNpo] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [sponsorRes, npoRes] = await Promise.all([
        fetch("/api/admin/sponsors"),
        fetch("/api/admin/npos"),
      ]);
      if (sponsorRes.ok) {
        const sponsorData = await sponsorRes.json();
        setSponsors(sponsorData.sponsors || []);
      }
      if (npoRes.ok) {
        const npoData = await npoRes.json();
        setNpos(npoData.npos || []);
        if (npoData.npos?.length > 0) {
          setFormNpo(npoData.npos[0].id);
        }
      }
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-8 h-16 animate-pulse rounded-2xl bg-gray-100" />
        <div className="mb-8 h-48 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0D1B2A]">Sponsor Management</h1>

      {/* Phase 2 banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4"
      >
        <span className="text-2xl">!</span>
        <div>
          <p className="text-sm font-semibold text-yellow-800">
            Phase 2 feature. Currently in preparation.
          </p>
          <p className="mt-0.5 text-xs text-yellow-600">
            Sponsor features will go live in Phase 2. Data shown is from the database.
          </p>
        </div>
      </motion.div>

      {/* Section 1: Sponsor List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Sponsor List</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-xs text-white transition-all duration-200 hover:opacity-90"
          >
            Add Sponsor
          </button>
        </div>
        {sponsors.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No sponsors registered yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1B2A] text-white">
                  <th className="rounded-tl-lg px-2 py-3 text-left font-medium">Company</th>
                  <th className="px-2 py-3 text-right font-medium">Budget</th>
                  <th className="px-2 py-3 text-left font-medium">Tag</th>
                  <th className="px-2 py-3 text-left font-medium">Period</th>
                  <th className="rounded-tr-lg px-2 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((sponsor, sponsorIdx) => (
                  <tr
                    key={sponsor.id}
                    className={`border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${sponsorIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-2 py-3 font-medium text-gray-900">{sponsor.company_name}</td>
                    <td className="px-2 py-3 text-right text-gray-700">
                      Y{sponsor.budget.toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-xs text-[#2A9D8F]">{sponsor.tag}</td>
                    <td className="px-2 py-3 text-xs text-gray-500">
                      {sponsor.start_date} -- {sponsor.end_date}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${sponsorStatusColor[sponsor.status] || ""}`}
                      >
                        {sponsorStatusLabel[sponsor.status] || sponsor.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Section 2: Sponsor Registration Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-5 text-sm font-semibold text-gray-700">Sponsor Registration Form</h3>
          <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Company Name</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Company name..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Contact</label>
              <input
                type="text"
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                placeholder="Email or phone"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Total Budget</label>
              <input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                placeholder="Y"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tag</label>
              <input
                type="text"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="#CompanyYOLO..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Age Group</label>
              <select
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55+">55+</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Gender</label>
              <select
                value={formGender}
                onChange={(e) => setFormGender(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Pet Type</label>
              <select
                value={formPetType}
                onChange={(e) => setFormPetType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Region</label>
              <select
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="hokkaido">Hokkaido</option>
                <option value="tohoku">Tohoku</option>
                <option value="kanto">Kanto</option>
                <option value="chubu">Chubu</option>
                <option value="kinki">Kinki</option>
                <option value="chugoku">Chugoku</option>
                <option value="shikoku">Shikoku</option>
                <option value="kyushu">Kyushu</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Allocated Budget</label>
              <input
                type="number"
                value={formAllocated}
                onChange={(e) => setFormAllocated(e.target.value)}
                placeholder="Y"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">NPO Partner</label>
              <select
                value={formNpo}
                onChange={(e) => setFormNpo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              >
                {npos.length === 0 ? (
                  <option value="">No NPOs available</option>
                ) : (
                  npos.map((npo) => (
                    <option key={npo.id} value={npo.id}>
                      {npo.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">End Date</label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
          </div>
          <button className="mt-6 rounded-xl bg-[#2A9D8F] px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90">
            Save Settings
          </button>
        </motion.div>
      )}

      {/* Section 3: Sponsor Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Sponsor Reports</h3>
          <button className="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-600 transition-all duration-200 hover:bg-gray-200">
            PDF Export
          </button>
        </div>
        {sponsors.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No sponsor reports available</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {sponsors.map((sponsor) => {
              const npo = npos.find((n) => n.id === sponsor.npo_id);
              return (
                <div
                  key={sponsor.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">{sponsor.company_name}</h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${sponsorStatusColor[sponsor.status] || ""}`}
                    >
                      {sponsorStatusLabel[sponsor.status] || sponsor.status}
                    </span>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-400">Posts</p>
                      <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                        {(sponsor.post_count || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-400">Impressions</p>
                      <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                        {(sponsor.impressions || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-400">Donation</p>
                      <p className="text-lg font-bold text-[#2A9D8F]">
                        Y{(sponsor.donation_total || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-400">NPO Partner</p>
                      <p className="truncate text-sm font-medium text-gray-700">
                        {npo?.name || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Tag: {sponsor.tag}</span>
                    <span>Budget: Y{sponsor.budget.toLocaleString()}</span>
                  </div>
                  {/* Budget consumption bar */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                      <span>Budget Used</span>
                      <span>
                        {sponsor.budget > 0
                          ? Math.round(((sponsor.donation_total || 0) / sponsor.budget) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-[#2A9D8F] transition-all"
                        style={{
                          width: `${Math.min(100, sponsor.budget > 0 ? Math.round(((sponsor.donation_total || 0) / sponsor.budget) * 100) : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
