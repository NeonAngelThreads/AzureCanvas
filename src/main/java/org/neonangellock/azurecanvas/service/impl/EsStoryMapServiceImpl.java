package org.neonangellock.azurecanvas.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.neonangellock.azurecanvas.model.es.EsStoryMap;
import org.neonangellock.azurecanvas.repository.es.EsStoryMapRepository;
import org.neonangellock.azurecanvas.service.EsStoryMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchShardStatistics;
import org.springframework.data.elasticsearch.core.suggest.response.Suggest;
import org.springframework.data.elasticsearch.core.query.HighlightQuery;
import org.springframework.data.elasticsearch.core.query.highlight.Highlight;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightField;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class EsStoryMapServiceImpl implements EsStoryMapService {

    @Autowired(required = false)
    private EsStoryMapRepository esStoryMapRepository;

    @Autowired(required = false)
    private ElasticsearchOperations elasticsearchOperations;

    @Override
    public SearchHits<EsStoryMap> searchStoryMap(String keyword, int page, int size) {
        // 从本地 JSON 文件读取数据
        try {
            System.out.println("Reading storymap data from local JSON file...");

            // 获取 JSON 文件的路径
            java.io.InputStream inputStream = getClass().getClassLoader()
                    .getResourceAsStream("json/storymap_posts.json");
            if (inputStream == null) {
                System.err.println("JSON file not found in classpath: json/storymap_posts.json");
                return createEmptySearchHits();
            }

            // 读取 JSON 文件内容
            java.util.Scanner scanner = new java.util.Scanner(inputStream,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            StringBuilder jsonContent = new StringBuilder();
            while (scanner.hasNextLine()) {
                jsonContent.append(scanner.nextLine());
            }
            scanner.close();
            inputStream.close();

            String jsonStr = jsonContent.toString();
            System.out.println("JSON content length: " + jsonStr.length());

            if (jsonStr == null || jsonStr.isEmpty()) {
                System.err.println("JSON file is empty");
                return createEmptySearchHits();
            }

            List<EsStoryMap> esStoryMaps = new ArrayList<>();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Map<String, Object>> dataList = objectMapper.readValue(jsonStr,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));

                System.out.println("Parsed " + dataList.size() + " storymap items from JSON");

                // 将 JSON 数据转换为 EsStoryMap
                for (Map<String, Object> data : dataList) {
                    EsStoryMap item = new EsStoryMap();
                    item.setStoryMapId(String.valueOf(data.getOrDefault("storyMapId", "")));
                    item.setTitle((String) data.getOrDefault("title", ""));
                    item.setDescription((String) data.getOrDefault("description", ""));
                    item.setCategory((String) data.getOrDefault("category", ""));
                    item.setLocation((String) data.getOrDefault("location", ""));
                    item.setLat((Double) data.getOrDefault("lat", 0.0));
                    item.setLng((Double) data.getOrDefault("lng", 0.0));
                    item.setLikes((Integer) data.getOrDefault("likes", 0));
                    item.setComments((Integer) data.getOrDefault("comments", 0));
                    item.setAuthorID((String) data.getOrDefault("authorID", ""));
                    item.setAuthor((String) data.getOrDefault("author", ""));
                    item.setCreatedAt((String) data.getOrDefault("createdAt", ""));
                    item.setUpdatedAt((String) data.getOrDefault("updatedAt", ""));

                    esStoryMaps.add(item);
                }

                // 保存到本地 ES 索引
                if (!esStoryMaps.isEmpty() && elasticsearchOperations != null && esStoryMapRepository != null) {
                    try {
                        System.out.println("Saving " + esStoryMaps.size() + " storymap items to local ES index...");
                        esStoryMapRepository.saveAll(esStoryMaps);
                        System.out.println("Successfully saved storymap items to local ES index");
                    } catch (Exception e) {
                        System.err.println("Failed to save storymap items to local ES: " + e.getMessage());
                    }
                }
            } catch (JsonProcessingException e) {
                System.err.println("Failed to parse storymap JSON data: " + e.getMessage());
                e.printStackTrace();
            }
        } catch (Exception e) {
            System.err.println("Failed to read storymap data from local JSON: " + e.getMessage());
            e.printStackTrace();
        }

        // 使用本地 ES 进行搜索
        try {
            if (elasticsearchOperations != null) {
                try {
                    NativeQuery query = NativeQuery.builder()
                            .withQuery(q -> q.multiMatch(m -> m.fields("title", "description", "location").query(keyword)))
                            .withPageable(PageRequest.of(page, size))
                            .withHighlightQuery(new HighlightQuery(
                                    new Highlight(List.of(new HighlightField("title"), new HighlightField("description"), new HighlightField("location"))),
                                    EsStoryMap.class))
                            .build();
                    System.out.println("Searching storymap in local ES with keyword: " + keyword);
                    return elasticsearchOperations.search(query, EsStoryMap.class);
                } catch (Exception e) {
                    System.err.println("Local ES storymap search failed: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.err.println("Elasticsearch operation failed: " + e.getMessage());
            e.printStackTrace();
        }

        // 返回空结果
        return createEmptySearchHits();
    }

    private SearchHits<EsStoryMap> createEmptySearchHits() {
        return new SearchHits<EsStoryMap>() {
            public long getTotalHits() {
                return 0;
            }

            public org.springframework.data.elasticsearch.core.TotalHitsRelation getTotalHitsRelation() {
                return org.springframework.data.elasticsearch.core.TotalHitsRelation.EQUAL_TO;
            }

            public float getMaxScore() {
                return 0f;
            }

            public Suggest getSuggest() {
                return null;
            }

            public List<org.springframework.data.elasticsearch.core.SearchHit<EsStoryMap>> getSearchHits() {
                return Collections.emptyList();
            }

            public org.springframework.data.elasticsearch.core.SearchHit<EsStoryMap> getSearchHit(int index) {
                throw new IndexOutOfBoundsException();
            }

            public List<EsStoryMap> getSearchHitsContents() {
                return Collections.emptyList();
            }

            public boolean hasSearchHits() {
                return false;
            }

            public org.springframework.data.elasticsearch.core.AggregationsContainer<?> getAggregations() {
                return null;
            }

            public <A> A getAggregation(String name, Class<A> aClass) {
                return null;
            }

            public SearchShardStatistics getSearchShardStatistics() {
                return null;
            }

            public String getPointInTimeId() {
                return null;
            }

            public java.time.Duration getExecutionDuration() {
                return java.time.Duration.ZERO;
            }
        };
    }

    @Override
    public void syncStoryMapFromJson() {
        searchStoryMap("", 0, 100); // 同步所有数据
    }

    @Override
    public List<EsStoryMap> getAllStoryMaps(int page, int size) {
        // 先确保数据已经同步到ES
        syncStoryMapFromJson();

        // 从ES中获取所有数据
        try {
            if (elasticsearchOperations != null) {
                try {
                    NativeQuery query = NativeQuery.builder()
                            .withQuery(q -> q.matchAll(m -> m))
                            .withPageable(PageRequest.of(page, size))
                            .build();
                    System.out.println("Fetching all storymaps from local ES");
                    SearchHits<EsStoryMap> searchHits = elasticsearchOperations.search(query, EsStoryMap.class);
                    return searchHits.getSearchHits().stream()
                            .map(hit -> hit.getContent())
                            .collect(java.util.stream.Collectors.toList());
                } catch (Exception e) {
                    System.err.println("Failed to fetch all storymaps from ES: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.err.println("Elasticsearch operation failed: " + e.getMessage());
            e.printStackTrace();
        }

        // 如果ES不可用，从JSON文件读取数据
        return readStoryMapsFromJson();
    }

    private List<EsStoryMap> readStoryMapsFromJson() {
        try {
            System.out.println("Reading all storymap data from local JSON file...");

            java.io.InputStream inputStream = getClass().getClassLoader()
                    .getResourceAsStream("json/storymap_posts.json");
            if (inputStream == null) {
                System.err.println("JSON file not found in classpath: json/storymap_posts.json");
                return new ArrayList<>();
            }

            java.util.Scanner scanner = new java.util.Scanner(inputStream,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            StringBuilder jsonContent = new StringBuilder();
            while (scanner.hasNextLine()) {
                jsonContent.append(scanner.nextLine());
            }
            scanner.close();
            inputStream.close();

            String jsonStr = jsonContent.toString();

            if (jsonStr == null || jsonStr.isEmpty()) {
                System.err.println("JSON file is empty");
                return new ArrayList<>();
            }

            List<EsStoryMap> esStoryMaps = new ArrayList<>();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Map<String, Object>> dataList = objectMapper.readValue(jsonStr,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));

                System.out.println("Parsed " + dataList.size() + " storymap items from JSON");

                for (Map<String, Object> data : dataList) {
                    EsStoryMap item = new EsStoryMap();
                    item.setStoryMapId(String.valueOf(data.getOrDefault("storyMapId", "")));
                    item.setTitle((String) data.getOrDefault("title", ""));
                    item.setDescription((String) data.getOrDefault("description", ""));
                    item.setCategory((String) data.getOrDefault("category", ""));
                    item.setLocation((String) data.getOrDefault("location", ""));
                    item.setLat((Double) data.getOrDefault("lat", 0.0));
                    item.setLng((Double) data.getOrDefault("lng", 0.0));
                    item.setLikes((Integer) data.getOrDefault("likes", 0));
                    item.setComments((Integer) data.getOrDefault("comments", 0));
                    item.setAuthorID((String) data.getOrDefault("authorID", ""));
                    item.setAuthor((String) data.getOrDefault("author", ""));
                    item.setCreatedAt((String) data.getOrDefault("createdAt", ""));
                    item.setUpdatedAt((String) data.getOrDefault("updatedAt", ""));

                    esStoryMaps.add(item);
                }
            } catch (JsonProcessingException e) {
                System.err.println("Failed to parse storymap JSON data: " + e.getMessage());
                e.printStackTrace();
            }

            return esStoryMaps;
        } catch (Exception e) {
            System.err.println("Failed to read storymap data from local JSON: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
