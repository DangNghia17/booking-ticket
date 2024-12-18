import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineDownload } from "react-icons/md";

function Download(props) {
  const { bookingId } = props;
  const { t } = useTranslation();
  
  const downloadImage = async () => {
    const node = document.getElementById(`ticket-${bookingId}`);
    node.crossOrigin = "anonymous";

    try {
      // Tạo image từ HTML
      const imagePng = await htmlToImage.toPng(node);
      
      // Tính toán kích thước mới (50% kích thước gốc)
      const scaleFactor = 0.5;
      const scaledWidth = node.offsetWidth * scaleFactor;
      const scaledHeight = node.offsetHeight * scaleFactor;
      
      // Tạo PDF với kích thước đã scale
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [scaledWidth + 20, scaledHeight + 20] // Thêm padding 10px mỗi bên
      });

      // Thêm ảnh vào PDF với kích thước đã scale
      pdf.addImage(imagePng, "PNG", 10, 10, scaledWidth, scaledHeight);

      // Lưu file
      const filename = `LotusTicket-${bookingId}`;
      pdf.save(filename + ".pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <button
      onClick={downloadImage}
      className="px-4 py-2 bg-[#1f3e82] rounded-md flex items-center gap-x-2 text-white font-medium text-xl"
    >
      <p>{t("ticket.download")}</p>
      <MdOutlineDownload color="white" />
    </button>
  );
}

export default Download;
