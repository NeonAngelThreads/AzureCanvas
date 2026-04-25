package org.neonangellock.azurecanvas.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.neonangellock.azurecanvas.model.es.EsTreeHole;
import org.neonangellock.azurecanvas.repository.es.EsTreeHoleRepository;
import org.neonangellock.azurecanvas.service.EsTreeHoleService;
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
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class EsTreeHoleServiceImpl implements EsTreeHoleService {

    @Autowired(required = false)
    private EsTreeHoleRepository esTreeHoleRepository;

    @Autowired(required = false)
    private ElasticsearchOperations elasticsearchOperations;

    private final RestTemplate restTemplate;
    private static final String TREEHOLE_API_URL = "https://api.szsummer.com/test/treehole/data";

    public EsTreeHoleServiceImpl() {
        // 创建支持UTF-8编码的RestTemplate
        this.restTemplate = new RestTemplate();
        List<HttpMessageConverter<?>> messageConverters = new ArrayList<>();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter
                .setSupportedMediaTypes(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.ALL));
        messageConverters.add(converter);
        this.restTemplate.setMessageConverters(messageConverters);
    }

    @Override
    public SearchHits<EsTreeHole> searchTreeHole(String keyword, int page, int size) {
        // 从本地 JSON 文件读取数据
        try {
            System.out.println("Reading treehole data from local JSON file...");

            // 获取 JSON 文件的路径
            java.io.InputStream inputStream = getClass().getClassLoader()
                    .getResourceAsStream("json/treehole_posts.json");
            if (inputStream == null) {
                System.err.println("JSON file not found in classpath: json/treehole_posts.json");
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

            List<EsTreeHole> esTreeHoles = new ArrayList<>();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Map<String, Object>> dataList = objectMapper.readValue(jsonStr,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));

                System.out.println("Parsed " + dataList.size() + " treehole items from JSON");

                // 将 JSON 数据转换为 EsTreeHole
                for (Map<String, Object> data : dataList) {
                    EsTreeHole item = new EsTreeHole();
                    item.setId(String.valueOf(data.getOrDefault("id", "")));
                    item.setBoardName((String) data.getOrDefault("board_name", ""));
                    item.setTitle((String) data.getOrDefault("title", ""));
                    item.setContent((String) data.getOrDefault("content", ""));

                    esTreeHoles.add(item);
                }

                // 保存到本地 ES 索引
                if (!esTreeHoles.isEmpty() && elasticsearchOperations != null) {
                    try {
                        System.out.println("Saving " + esTreeHoles.size() + " treehole items to local ES index...");
                        esTreeHoleRepository.saveAll(esTreeHoles);
                        System.out.println("Successfully saved treehole items to local ES index");
                    } catch (Exception e) {
                        System.err.println("Failed to save treehole items to local ES: " + e.getMessage());
                    }
                }
            } catch (JsonProcessingException e) {
                System.err.println("Failed to parse treehole JSON data: " + e.getMessage());
                e.printStackTrace();
            }
        } catch (Exception e) {
            System.err.println("Failed to read treehole data from local JSON: " + e.getMessage());
            e.printStackTrace();
        }

        // 使用本地 ES 进行搜索
        try {
            if (elasticsearchOperations != null) {
                try {
                    NativeQuery query = NativeQuery.builder()
                            .withQuery(q -> q.multiMatch(m -> m.fields("title", "content").query(keyword)))
                            .withPageable(PageRequest.of(page, size))
                            .withHighlightQuery(new HighlightQuery(
                                    new Highlight(List.of(new HighlightField("title"), new HighlightField("content"))),
                                    EsTreeHole.class))
                            .build();
                    System.out.println("Searching treehole in local ES with keyword: " + keyword);
                    return elasticsearchOperations.search(query, EsTreeHole.class);
                } catch (Exception e) {
                    System.err.println("Local ES treehole search failed: " + e.getMessage());
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

    private SearchHits<EsTreeHole> createEmptySearchHits() {
        return new SearchHits<EsTreeHole>() {
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

            public List<org.springframework.data.elasticsearch.core.SearchHit<EsTreeHole>> getSearchHits() {
                return Collections.emptyList();
            }

            public org.springframework.data.elasticsearch.core.SearchHit<EsTreeHole> getSearchHit(int index) {
                throw new IndexOutOfBoundsException();
            }

            public List<EsTreeHole> getSearchHitsContents() {
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
    public void syncTreeHoleFromApi() {
        searchTreeHole("", 0, 100); // 同步所有数据
    }
}
