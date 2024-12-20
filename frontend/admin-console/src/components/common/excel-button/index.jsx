import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { SiMicrosoftexcel } from "react-icons/si";
import { AlertErrorPopup } from "../../Alert";
import { useTranslation } from "react-i18next";
function ExportExcelButton({ data, columns, filename }) {
  const { t } = useTranslation();
  const handleExportExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(filename);

    // Add table name as the first row
    worksheet.addRow([filename]);
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // Skip a row before adding the data
    worksheet.addRow([]);

    worksheet.columns = columns;
    if (data.length === 0) {
      AlertErrorPopup({
        title: t("popup.export-excel"),
      });
    } else {
      data.forEach((row) => {
        worksheet.addRow(row);
      });
      worksheet.getRow(2).font = { bold: true }; // Apply formatting to the second row (after the title row)
      worksheet.getRow(2).alignment = { horizontal: "center" };

      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, filename);
      });
    }
  };
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                 bg-white border border-gray-200 rounded-lg hover:bg-gray-50
                 transition-colors duration-200"
      onClick={handleExportExcel}
    >
      <SiMicrosoftexcel className="text-green-600 text-lg" />
      <span>Export Excel</span>
    </button>
  );
}

export default ExportExcelButton;
