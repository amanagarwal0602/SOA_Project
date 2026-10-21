package com.lumiere.soa.repository;

import com.lumiere.soa.model.CafeContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CafeContentRepository extends JpaRepository<CafeContent, String> {
}
