import React from 'react';
import { Pin, MapPin, Eye, ArrowRight } from 'lucide-react';

const LocationCard = ({
  location,
  isFavorite,
  onToggleFavorite,
  onClick,
  safeStr,
  parseContactsList,
  getCategoryTheme,
}) => {
  const displayTitle = safeStr(location.title);
  const contactLines = parseContactsList(location);
  const theme = getCategoryTheme(location.category);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group relative transition-all hover:shadow-md">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition active:scale-95 ${
            isFavorite
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-500'
              : 'bg-white/90 border border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          <Pin
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-emerald-500 text-emerald-500' : ''
            }`}
          />
        </button>
      </div>

      <div className="cursor-pointer flex flex-col h-full" onClick={onClick}>
        <div className="w-full aspect-[16/10] bg-slate-100 overflow-hidden relative shrink-0 border-b border-slate-100">
          <img
            src={location.image}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
            alt="img"
          />
        </div>

        <div className="p-3 flex flex-col justify-between flex-1 bg-white">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 w-fit ${theme.badge}`}
              >
                {theme.emoji} {safeStr(location.category)}
              </span>

              <span className="text-[10px] text-slate-300">|</span>

              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                <MapPin className={`w-3 h-3 ${theme.icon}`} />
                {safeStr(location.commune) || 'រតនមណ្ឌល'}
              </span>
            </div>

            <h3 className="font-bold text-[14px] leading-tight line-clamp-1 mb-2 text-slate-900">
              {displayTitle}
            </h3>

            <div className="mb-2 space-y-1">
              {contactLines.slice(0, 1).map((c, i) => (
                <div
                  key={i}
                  className="text-[11.5px] font-medium truncate text-slate-800"
                >
                  👤 {safeStr(c.name)}:{' '}
                  <span className="font-bold ml-1 text-sky-600">
                    {safeStr(c.phone)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11.5px] text-slate-700 leading-relaxed line-clamp-2 mb-2 font-medium">
              {safeStr(location.desc)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
            <span className="text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md border text-slate-500 bg-slate-50 border-slate-200">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {location.views || 0} ដង
            </span>

            <span className="text-[10px] font-bold text-[#38BDF8] flex items-center gap-0.5">
              លម្អិត <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;