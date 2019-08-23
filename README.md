# Quick Start

1. `npm i`
2. `npm run start -- --sample-size 20`


# Scaling the analysis of song metadata

# Streaming

The solution utses `stream-json` module to define a JSON processing pipelinewith a minimal memory footprint. Optimizing runtime memory by not using streaming primitives of javascript is an optimization that addresses scale issues.

# Parsing

## Dataset Sanitization

### Issues
Manual transformation of the given `ndsjon` into a json array was done to comply with the `stream-json` streaming module.

### Improvements
Programatically transforming `ndsjon` before streaming into `stream-json` would remove the depenency on manual work. This mitigates work that is tedious, and prone to mistakes, which can be costly at scale.

Better yet, switching `stream-json` for a module that supports `ndjson` would  be ideal.

## Accuracy

### Issues
1. This iteration of the solution assumes sections of songs are all tagged with headers. Thus a section with not headers is lumped into the previous section. 
2. This could cause attribution accuracy errors wherein the section with no headers is attributed to the collaborators of the previous section, instead of the `primary_artist`

### Improvements
1. Matching sections without headers occurs via the `matchSections` method of `src/parse/sections.js`.
2. Attribution should be tested and improved in the `sections.forEach` iterator of `src/analyze/index.js`


## Speed

### Issues
Matching requires regular expressions. The `compromise` module is used to facilitate matching. There is also some slower javascript regular expressions sprinkled in. Early iterations saw processing time increase by 8 seconds with the addition of regex matching.

### Improvements
 At scale, full coverage of optimized matching would benefit the speed of parsing at scale. Utlizing compiled regex would result in faster processing of sections and headers and word per section. 

 The parsing pipeline was developed with modulairty in mind. While `compromise` was used for the initial iteration, other libs may be optimized for different tasks, such as tokenization. Switching these modules according to the task at hand would be a good step towards optimized speeds.

# NLP

## Unstructured headers data

### Issues
Normalization of the headers required regex and #Person recognition via NLP. The module `compromise` facilitated the entity recognition.

### Improvements
Offloading the #Person entity recognition step to a service such as AWS Comprehend Entity recognition could result in speed and accuracy gains. A fully managed recognition engine, leveraging Comprehend would offer auto scaling and managed process for training the NLP engine to the unstructured headers data. 

## Custom Lexicon

### Issues
Early in development, processing speed dropped from 102644.332ms to 309240.709ms, i.e. 1.7 minutes to 5.1 minutes after using a custom lexicon onto the `compromise` NLP engine.

### Improvements
Yet, using a custom lexcion resulted in improvements  to artists recognition from the unstructured headers. For example, the following is a list of accuracy refinements made by the use of a lexicon

```
wayne => Lil Wayne
sean => Big Sean
chainz => 2 Chainz
```

## Machine Learning


External libraries or services can be leveraged to decouple the analysis pipeline from the cost of building and using a smarter tagging engine for artist recognition in unstructure song headers. Here is a list considered during this exercise:

### Improvements: Dependencies
- Natural
- Spacy

### Improvements: Infrastructure
Serverless machine learning would reduce the runtime of the pipeline. NLP Models can be continuosly trained on separate processes, on AWS managed services. Instead of streaming all of the data in batches, an approach could be to pick only the headers data and train the `AWS Comprehend` service on the structure and entities of the artist collaborator headers. Then, a downstream transfer of the pre-trained header models would be leveraged by analysis tasks.

# Analysis

## Speed

### Issues
Average processing time per song was < 1000ms in this solution.
Worst case, given 2K songs, the pipeline would need 2M milliseconds i.e. ~33 minutes to complete
Average cases, given 2K songs, the pipline took 1,069,973 millieseconds i.e. ~17 minutes to complte

Other cases are listed below.

#### 2K records
```
milliseconds, minutes
1041185.629, ~17
...
...
```

#### 20 records
```
milliseconds, seconds
10174.880ms, ~10
14248.226ms, ~14
12128.469ms, ~12
11726.787ms, ~11
11030.764ms, ~11
10980.603ms, ~10
...
...
```

#### 10 records
```
milliseconds, seconds
7744.019ms, ~8
8155.056ms, ~8
7050.314ms, ~7
6073.729ms, ~6
8226.895ms, ~8
8339.329ms, ~8
5973.358ms, ~6
5658.969ms, ~6
...
...
```


### Improvements
Batching 2K songs into one run is too costly in terms of time and memory. Parrel processing (using serverless infrastructure) of parsing and recognition stages of the pipeline would offer speed improvements. Once parallel processes are complete, a reconciliation server could aggregate the result sets from stores written to by the parallel process. These would then be passed through the analysis and storage stages of the pipeline.

## Attribution Algorithm

### Issues
Given a song with a primary artist `primary` and `s` number of sections, each with their own headers, attribution analysis currently attributes all sections to the primary artist, as well as to the collaborating artists parsed from the headers. This is to satisfy two different requirements. 

### Improvements
The algorithm could be optimized for accuracy, processing time and memory overhead in the `songs` reducer and the `sections` iterator found in `src/analyze/index.js` .

Cases such as this are desrcibed in the `/test/*.spec.js` files, labelled with `xit`

# Testing

The streaming parsing, and analysis pipeline can be tested using jest. This solution includes some basic tests implemented early on, before developing a working pipeline took priority. 

Ideallly full test coverage of parsing, matching, and attribution would be acheived. At scale, this coverage would ensure that further iterations on the pipeline would be non breaking. 

## Sampling developing facilitates iterative solutions

At decreasing scales, from 5M to 2K, to 10 songs, the pipeline runs faster, allowing for developers to iterate on code without having to process the entire scale of the given stream. This test methodology was prioritized and implemented, and is described below.

### `analyzeSample`

The analysis pipeline accepts arguments for `--sample-size`. Given a `STREAM_SIZE` (hardcoded for this iteration), the pipeline will be transformed to a subset of `sampleSize` songs. 

These songs are by default, the first `sampleSize` songs of the input stream. They can also be `--random true`. Defaults are defined in the `program.option` block of `src/index.js` and used in the method signature, below:

`analyzeSample = ({random = false, sampleSize = 10, streamSize = 2000} = {})`

## Performance and load testing

- console.time outputs execution time for blocks of code during development
- V8 Profiler observes and outputs data and metrics to understand performance of code
- Flamebearer renders flamegraph which can help identify issues during execution

# Dashboard 

## Storage
noSQL such as Mongo document could store the `output.txt` data i.e. the top 5 artists for the defined set of metrics to be accessed by a dashboard. The data pipeline would need to be extended to write to the storage layer. 

## API
Node microservice could respond to requests for metrics by querying the storage layer for aggregated metrics. Leveraging modules such as `Express`, `HAPI`, `Mongoose`, `TypeScript` could facilitate development at scale.

## Front End Microservice
React could render dashboard UI. Ideally it would be developed to be independently deployed, so as to not couple API development with UI development. The React app would send authenticated queries to the API for metrics data and render tables and charts to make the metrics digestible.

## Data Integrity Over Time
Neither the dashboard nor API would ever trigger the analysis pipeline. Dashboard services would be accessing aggregated and cached result sets from a storage layer. 

Because the initial iteration of the data pipeline is costly in terms of compute time resources, there would be a need for a service that given a new song, could recompute, reconcile the metrics. 

The process for reconciling new song data into the analysis could be realtime. Extending the pipeline with a storage layer and even driven reconciliation would allow a single song to update the cache accessed by the dashboard API.

## Further Enhancements

Time travel would be an interesting feature to introduce to the dashboard. That is to say, allowing an end user to choose a date for which they are interested in viewing a snapshot of the top 5 metrics on the chosen date. This would require the data pipeline to be archived given certain conditions (such as a archive interval) and stored independently of the cache representing the "real time" top 5 metrics.
