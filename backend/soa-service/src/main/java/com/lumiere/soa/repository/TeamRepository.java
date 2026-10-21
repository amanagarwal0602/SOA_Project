package com.lumiere.soa.repository;

import com.lumiere.soa.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<TeamMember, String> {
    List<TeamMember> findByShowOnAboutTrueOrderByDisplayOrderAsc();
    List<TeamMember> findAllByOrderByDisplayOrderAsc();
}
