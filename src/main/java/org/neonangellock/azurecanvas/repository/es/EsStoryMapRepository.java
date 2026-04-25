package org.neonangellock.azurecanvas.repository.es;

import org.neonangellock.azurecanvas.model.es.EsStoryMap;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface EsStoryMapRepository extends ElasticsearchRepository<EsStoryMap, String> {
}
