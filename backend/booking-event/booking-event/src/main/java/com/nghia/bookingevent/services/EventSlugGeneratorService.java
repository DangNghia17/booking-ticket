package com.nghia.bookingevent.services;


import com.nghia.bookingevent.Implement.IEventSlugGeneratorService;

import com.nghia.bookingevent.models.event.EventSlug;
import com.nghia.bookingevent.repository.EventSlugGeneratorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.nghia.bookingevent.utils.Utils.toSlug;

@Service
@RequiredArgsConstructor
public class EventSlugGeneratorService implements IEventSlugGeneratorService {

    private final EventSlugGeneratorRepository sequenceGeneratorRepository;

    @Override
    public String generateSlug(String slug) {
        EventSlug eventSlug = sequenceGeneratorRepository.findById(slug)
                .orElse(new EventSlug(slug, toSlug(slug)));
        String sequence = eventSlug.getSlug();
        return sequence;
    }
}
