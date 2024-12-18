import React from "react";
import { useTranslation } from "react-i18next";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { BiSolidMoviePlay } from "react-icons/bi";
import { MdSportsSoccer, MdBusinessCenter } from "react-icons/md";

function CategoryItem({ category, icon, onClick }) {
  const { t } = useTranslation();

  const getCategoryIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'music':
        return <BsMusicNoteBeamed className="w-6 h-6 text-indigo-600" />;
      case 'comedy':
        return <BiSolidMoviePlay className="w-6 h-6 text-pink-600" />;
      case 'sport':
        return <MdSportsSoccer className="w-6 h-6 text-green-600" />;
      case 'conference':
        return <MdBusinessCenter className="w-6 h-6 text-blue-600" />;
      default:
        return <BsMusicNoteBeamed className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCategoryColor = (type) => {
    switch (type.toLowerCase()) {
      case 'music':
        return 'bg-indigo-50 group-hover:bg-indigo-100';
      case 'comedy':
        return 'bg-pink-50 group-hover:bg-pink-100';
      case 'sport':
        return 'bg-green-50 group-hover:bg-green-100';
      case 'conference':
        return 'bg-blue-50 group-hover:bg-blue-100';
      default:
        return 'bg-gray-50 group-hover:bg-gray-100';
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-6 
                 hover:shadow-lg hover:border-gray-300
                 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className={`w-14 h-14 rounded-xl ${getCategoryColor(icon)} 
                        flex items-center justify-center transition-colors
                        shadow-sm group-hover:shadow`}
          >
            {getCategoryIcon(icon)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {t(category?.name)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {`${Math.floor(Math.random() * 10) + 1} events`}
            </p>
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default CategoryItem;
