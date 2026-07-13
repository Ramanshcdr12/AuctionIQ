package com.auctioniq.mapper;

import com.auctioniq.entity.SavedReport;
import com.auctioniq.dto.SavedReportDTO;

public class ReportMapper {

    public static SavedReportDTO toDTO(SavedReport report) {
        if (report == null) return null;
        return new SavedReportDTO(
            report.getId(),
            PlayerMapper.toDTO(report.getPlayer()),
            report.getReportContent(),
            report.getGeneratedAt()
        );
    }
}
