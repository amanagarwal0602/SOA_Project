package com.lumiere.order.service;

import com.lumiere.order.model.BillCounter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Atomic daily bill number via MongoDB findAndModify.
 */
@Service
@RequiredArgsConstructor
public class BillCounterService {

    private final MongoTemplate mongoTemplate;

    public int getNextDailyNumber() {
        String today = LocalDate.now().toString(); // YYYY-MM-DD
        Query query = new Query(Criteria.where("date").is(today));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options().returnNew(true).upsert(true);

        BillCounter counter = mongoTemplate.findAndModify(query, update, options, BillCounter.class);
        return counter != null ? counter.getSeq() : 1;
    }
}
