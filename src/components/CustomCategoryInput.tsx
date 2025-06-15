
import React, { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomCategoryInputProps {
  value: string;
  setValue: (cat: string) => void;
  categories: string[];
  setCategories: (cats: string[]) => void;
  placeholder?: string;
}

const CustomCategoryInput: React.FC<CustomCategoryInputProps> = ({
  value,
  setValue,
  categories,
  setCategories,
  placeholder = "Nova categoria"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [custom, setCustom] = useState("");

  function handleAddCategory() {
    if (!custom.trim()) return;
    if (categories.map(c => c.toLowerCase()).includes(custom.trim().toLowerCase())) return;
    const next = [...categories, custom.trim()];
    setCategories(next);
    setValue(custom.trim());
    setCustom("");
    window.localStorage.setItem("custom-categories-" + placeholder, JSON.stringify(next));
    if (inputRef.current) inputRef.current.focus();
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAddCategory();
  }

  return (
    <div>
      <div className="flex gap-2 mt-2 mb-1">
        <Input
          ref={inputRef}
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={handleInputKey}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={handleAddCategory} size="sm" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <span
              key={cat}
              className={`px-2 py-1 rounded text-xs cursor-pointer border ${cat === value
                ? "bg-blue-200 border-blue-400"
                : "bg-gray-100 border-gray-200"
              }`}
              onClick={() => setValue(cat)}
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomCategoryInput;
