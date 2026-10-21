package com.lumiere.soa.controller;

import com.lumiere.soa.model.TeamMember;
import com.lumiere.soa.repository.TeamRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamRepository teamRepository;

    public TeamController(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @GetMapping({"/api/team", "/api/team/all", "/team", "/team/all"})
    public ResponseEntity<List<TeamMember>> getTeam() {
        List<TeamMember> list = teamRepository.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/api/team", "/team"})
    public ResponseEntity<?> createTeamMember(@RequestBody Map<String, Object> body) {
        String id = body.get("id") != null ? body.get("id").toString() : "team_" + System.currentTimeMillis();
        String name = (String) body.get("name");
        String role = (String) body.get("role");
        String bio = (String) body.get("bio");
        String image = (String) body.get("image");

        boolean isActive = true;
        if (body.containsKey("isActive")) isActive = Boolean.parseBoolean(body.get("isActive").toString());
        else if (body.containsKey("is_active")) isActive = Boolean.parseBoolean(body.get("is_active").toString());

        boolean showOnAbout = true;
        if (body.containsKey("showInAbout")) showOnAbout = Boolean.parseBoolean(body.get("showInAbout").toString());
        else if (body.containsKey("show_on_about")) showOnAbout = Boolean.parseBoolean(body.get("show_on_about").toString());

        TeamMember member = TeamMember.builder()
                .id(id)
                .name(name)
                .role(role)
                .bio(bio)
                .image(image)
                .isActive(isActive)
                .showOnAbout(showOnAbout)
                .build();

        TeamMember saved = teamRepository.save(member);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping({"/api/team/{id}", "/team/{id}"})
    public ResponseEntity<?> updateTeamMember(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<TeamMember> opt = teamRepository.findById(id);
        TeamMember existing;
        if (opt.isEmpty()) {
            existing = TeamMember.builder().id(id).build();
        } else {
            existing = opt.get();
        }

        if (body.containsKey("name")) existing.setName((String) body.get("name"));
        if (body.containsKey("role")) existing.setRole((String) body.get("role"));
        if (body.containsKey("bio")) existing.setBio((String) body.get("bio"));
        if (body.containsKey("image")) existing.setImage((String) body.get("image"));

        if (body.containsKey("isActive")) existing.setActive(Boolean.parseBoolean(body.get("isActive").toString()));
        else if (body.containsKey("is_active")) existing.setActive(Boolean.parseBoolean(body.get("is_active").toString()));

        if (body.containsKey("showInAbout")) existing.setShowOnAbout(Boolean.parseBoolean(body.get("showInAbout").toString()));
        else if (body.containsKey("show_on_about")) existing.setShowOnAbout(Boolean.parseBoolean(body.get("show_on_about").toString()));

        TeamMember saved = teamRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping({"/api/team/{id}/toggle-about", "/team/{id}/toggle-about"})
    public ResponseEntity<?> toggleAbout(@PathVariable String id) {
        Optional<TeamMember> opt = teamRepository.findById(id);
        if (opt.isPresent()) {
            TeamMember m = opt.get();
            m.setShowOnAbout(!m.isShowOnAbout());
            TeamMember saved = teamRepository.save(m);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping({"/api/team/{id}", "/team/{id}"})
    public ResponseEntity<?> deleteTeamMember(@PathVariable String id) {
        teamRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
