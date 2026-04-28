import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const navigate = useNavigate();

  const results = useQuery(api.products.searchProducts, { searchTerm: q });

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-40 px-6">
      <div className="max-w-[1400px] mx-auto text-center">
        <h1 className="text-4xl md:text-5xl italic font-normal text-[#3a1f1d] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Search Results
        </h1>
        <p className="text-[#3a1f1d]/70 text-[15px] uppercase tracking-widest mb-16">
          {q ? `Showing results for "${q}"` : "Enter a search term"}
        </p>

        {results === undefined ? (
          <div className="flex justify-center"><div className="w-8 h-8 border-2 border-[#3a1f1d]/20 border-t-[#3a1f1d] rounded-full animate-spin"></div></div>
        ) : results.length === 0 ? (
          <div className="py-20 border border-[#3a1f1d]/10 bg-white max-w-2xl mx-auto">
            <p className="text-[#3a1f1d]/60 mb-6 font-light">No results found for '{q}'</p>
            <Button onClick={() => navigate("/shop")} variant="outline" className="border-[#3a1f1d] text-[#3a1f1d] rounded-none hover:bg-[#3a1f1d] hover:text-white uppercase tracking-widest text-[12px] px-8 py-6">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 text-left">
            {results.map((product) => (
              <div key={product._id} className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                <div className="relative aspect-[3/4] mb-6 bg-white overflow-hidden">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[14px] text-[#3a1f1d] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h3>
                  <p className="text-[13px] text-[#3a1f1d]/70">GH₵ {product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
