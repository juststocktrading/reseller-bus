'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/features/products/ProductCard';
import ProductFilterBar from '@/components/features/products/ProductFilterBar';
import { ProductService } from '@/services/product-service';
import { CategoryService } from '@/services/category-service';
import { Product, Category } from '@/lib/types';
import { FiShoppingBag } from 'react-icons/fi';

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [preOrderOnly, setPreOrderOnly] = useState(searchParams.get('isPreOrder') === 'true');

  useEffect(() => {
    Promise.all([ProductService.getProducts(), CategoryService.getCategories()])
      .then(([prodRes, catRes]) => {
        if (prodRes?.products) setProducts(prodRes.products);
        if (catRes?.categories) setCategories(catRes.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
    const matchesPreOrder = !preOrderOnly || p.isPreOrder;
    return matchesSearch && matchesCat && matchesPreOrder;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 bg-background text-foreground">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Products Catalog</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground leading-tight">
          Carefully curated picks from our best-loved essentials.
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Quality-checked cream grade clothing bales (95% New With Tags). Available for UK delivery,
          Bradford warehouse pickup, or international freight cargo.
        </p>
        <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
          <span>UK Shipping £20</span>
          <span>Ghana £50/bale</span>
          <span>Nigeria £60/bale</span>
          <span>Gambia £80/bale</span>
          <span>Europe Pro-rata</span>
        </div>
      </div>

      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        preOrderOnly={preOrderOnly}
        onPreOrderToggle={() => setPreOrderOnly(!preOrderOnly)}
      />

      {loading ? (
        <div className="text-center py-20 sm:py-24 text-muted-foreground font-medium animate-pulse">
          Loading wholesale stock catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-muted border border-border p-8 sm:p-12 rounded-2xl text-center space-y-3">
          <FiShoppingBag className="text-4xl text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold text-card-foreground">No products matched your search</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your category selection or clearing search terms.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setPreOrderOnly(false);
            }}
            className="btn-primary !w-auto px-6 mx-auto"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-24 text-muted-foreground animate-pulse">Loading wholesale stock catalog...</div>}>
      <ShopPageContent />
    </React.Suspense>
  );
}
