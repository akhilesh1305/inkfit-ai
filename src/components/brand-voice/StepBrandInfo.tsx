"use client";

import { motion } from "framer-motion";
import type { BrandVoiceFormData } from "@/lib/brand-voice";

interface StepBrandInfoProps {
  data: BrandVoiceFormData;
  onChange: (patch: Partial<BrandVoiceFormData>) => void;
}

export function StepBrandInfo({ data, onChange }: StepBrandInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card space-y-4"
    >
      <div>
        <h2 className="section-title">Brand Information</h2>
        <p className="mt-1 text-sm text-content-muted">
          Tell InkFit AI who you are and who you write for.
        </p>
      </div>
      <div>
        <label className="label" htmlFor="brandName">Brand Name</label>
        <input
          id="brandName"
          className="input-field"
          placeholder="e.g. InkFit AI"
          value={data.brandName}
          onChange={(e) => onChange({ brandName: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="industry">Industry</label>
        <input
          id="industry"
          className="input-field"
          placeholder="e.g. SaaS, Marketing, Healthcare"
          value={data.industry}
          onChange={(e) => onChange({ industry: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="targetAudience">Target Audience</label>
        <textarea
          id="targetAudience"
          className="input-field min-h-[100px] resize-y"
          placeholder="e.g. Founders, marketing teams, and agencies scaling content"
          value={data.targetAudience}
          onChange={(e) => onChange({ targetAudience: e.target.value })}
        />
      </div>
    </motion.div>
  );
}
