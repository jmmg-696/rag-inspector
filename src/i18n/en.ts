export const en = {
  "app.name": "RAG Inspector",
  "app.tagline": "Visual RAG playground",

  "common.skipToContent": "Skip to content",
  "common.local": "Local",
  "common.localMode": "LOCAL MODE",
  "common.localBody":
    "Documents are processed by the local RAG Inspector backend. No external AI API is required.",
  "common.retry": "Try again",
  "common.close": "Close",
  "common.closeNav": "Close navigation",
  "common.comingSoon": "Coming soon",
  "common.running": "Running",
  "common.step": "step {index} of {total}",
  "common.demoRun": "Demo run",
  "common.demoData": "Demo data",
  "common.pages": "Pages",
  "common.words": "Words",
  "common.characters": "Characters",
  "common.chunks": "Chunks",
  "common.tokens": "Tokens",
  "common.overlap": "Overlap",
  "common.chunkSize": "Chunk size",
  "common.status.ready": "Ready",
  "common.status.processing": "Processing",
  "common.status.failed": "Failed",
  "common.table.query": "Query",
  "common.table.retrievalScore": "Retrieval score",
  "common.table.chunks": "Chunks",
  "common.table.responseTime": "Response time",
  "common.table.ran": "Ran",
  "common.table.document": "Document",
  "common.table.type": "Type",
  "common.table.pages": "Pages",
  "common.table.added": "Added",
  "common.expandSidebar": "Expand sidebar",
  "common.collapseSidebar": "Collapse sidebar",
  "common.lightMode": "Switch to light mode",
  "common.darkMode": "Switch to dark mode",
  "common.language": "Language",

  "nav.overview": "Overview",
  "nav.mainLabel": "Main navigation",
  "nav.documents": "Documents",
  "nav.playground": "Playground",
  "nav.retrieval": "Retrieval",
  "nav.evaluation": "Evaluation",
  "nav.learn": "Learn",
  "nav.howRagWorks": "How RAG works",
  "nav.chunking": "Chunking",
  "nav.embeddings": "Embeddings",
  "nav.vectorSearch": "Vector Search",

  "overview.description":
    "Understand what happens between a question and an AI-generated answer.",
  "overview.badgeLocal": "Local mode",
  "overview.metric.documents": "Documents",
  "overview.metric.chunks": "Chunks",
  "overview.metric.vectors": "Vectors",
  "overview.metric.queries": "Queries",
  "overview.metric.documentsHint": "+2 this week",
  "overview.metric.chunksHint": "512 tokens · 15% overlap",
  "overview.metric.vectorsHint": "BGE-M3 · 1,024 dim",
  "overview.metric.queriesHint": "38 today",
  "overview.pipeline.title": "RAG Pipeline",
  "overview.pipeline.description":
    "Every answer travels the same path. Hover or click a stage to inspect it.",
  "overview.pipeline.stageLabel": "Pipeline stage",
  "overview.pipeline.legend.real": "Available today",
  "overview.pipeline.legend.next": "Current phase",
  "overview.pipeline.legend.planned": "Planned",
  "overview.recent.title": "Recent Queries",
  "overview.recent.description":
    "Latest questions run against the indexed knowledge.",

  "pipeline.stages.documents.label": "Documents",
  "pipeline.stages.documents.description":
    "Your knowledge starts as real files — PDFs, markdown docs, notes. Upload them and they are processed locally.",
  "pipeline.stages.chunking.label": "Chunking",
  "pipeline.stages.chunking.description":
    "Documents are divided into smaller, overlapping chunks so the model can retrieve precise fragments instead of whole files.",
  "pipeline.stages.embeddings.label": "Embeddings",
  "pipeline.stages.embeddings.description":
    "Each chunk is converted into a vector — a list of numbers that captures its meaning, not just its keywords.",
  "pipeline.stages.vector-store.label": "Vector Store",
  "pipeline.stages.vector-store.description":
    "Vectors are stored in an index that finds semantically similar pieces at scale, locally on your machine.",
  "pipeline.stages.retrieval.label": "Retrieval",
  "pipeline.stages.retrieval.description":
    "Finds the most semantically relevant chunks for a user's question by comparing the question's embedding against the stored vectors.",
  "pipeline.stages.context.label": "Context",
  "pipeline.stages.context.description":
    "The retrieved chunks are assembled, with their sources, into the prompt that the model will actually see.",
  "pipeline.stages.llm.label": "Local LLM",
  "pipeline.stages.llm.description":
    "A model running locally through Ollama generates an answer grounded in the provided context.",
  "pipeline.stages.answer.label": "Answer",
  "pipeline.stages.answer.description":
    "The generated answer comes back with its sources — grounded in your documents, traceable and inspectable.",
  "pipeline.stages.question.label": "Question",
  "pipeline.stages.question.description":
    "You ask something about your knowledge base.",
  "pipeline.stages.prompt.label": "Prompt",
  "pipeline.stages.prompt.description":
    "The context and the question are assembled into the exact prompt sent to the model — fully inspectable.",
  "pipeline.stages.sources.label": "Sources",
  "pipeline.stages.sources.description":
    "Citations in the answer point back to the specific chunks they came from.",

  "playground.title": "Playground",
  "playground.description":
    "Ask questions and inspect how RAG finds the answer.",
  "playground.newRun": "New run",
  "playground.placeholder": "Ask your knowledge base…",
  "playground.hint": "Enter to run · Shift+Enter for a new line",
  "playground.ask": "Ask",
  "playground.running": "Running…",
  "playground.empty.title": "RAG shouldn't be a black box.",
  "playground.empty.body":
    "Run a question and watch it travel through embedding, retrieval, context, prompt and local generation.",
  "playground.run.title": "Pipeline run",
  "playground.questionEcho": "Q: {question}",

  "retrieval.title": "Retrieval Inspector",
  "retrieval.description":
    "See which chunks your RAG system actually retrieves.",
  "retrieval.chunksTitle": "Retrieved Chunks",
  "retrieval.similarity": "Similarity",
  "retrieval.rank": "Rank {rank}",

  "evaluation.title": "Evaluation",
  "evaluation.description": "Measure the quality of your RAG pipeline.",
  "evaluation.badge": "Demo metrics",
  "evaluation.notice":
    "These are hypothetical quality metrics shown with mock data. Real evaluation runs (RAGAS-style scoring, golden datasets) arrive with the pipeline integration.",
  "evaluation.metric.answer-relevance.label": "Answer Relevance",
  "evaluation.metric.answer-relevance.description":
    "Is the generated answer on-topic for the question?",
  "evaluation.metric.context-relevance.label": "Context Relevance",
  "evaluation.metric.context-relevance.description":
    "Are the retrieved chunks relevant to the question?",
  "evaluation.metric.faithfulness.label": "Faithfulness",
  "evaluation.metric.faithfulness.description":
    "Is every claim in the answer supported by the context?",
  "evaluation.metric.retrieval-precision.label": "Retrieval Precision",
  "evaluation.metric.retrieval-precision.description":
    "How many retrieved chunks were actually used?",
  "evaluation.runs.title": "Evaluated Queries",
  "evaluation.runs.description":
    "{passed} of {total} questions passed all checks in the last demo run.",
  "evaluation.table.expected": "Expected",
  "evaluation.table.retrieved": "Retrieved",
  "evaluation.table.score": "Score",
  "evaluation.table.status": "Status",
  "evaluation.status.pass": "Pass",
  "evaluation.status.warn": "Review",
  "evaluation.status.fail": "Fail",

  "documents.title": "Documents",
  "documents.description":
    "Manage the knowledge used by your RAG pipeline.",
  "documents.upload": "Upload document",
  "documents.search.label": "Search documents",
  "documents.search.placeholder": "Search documents…",
  "documents.count": "{shown} of {total} documents",
  "documents.caption": "Indexed documents",
  "documents.noResults.title": "No documents match your search",
  "documents.noResults.body":
    "Nothing indexed contains “{term}”. Try a different term.",
  "documents.noResults.clear": "Clear search",
  "documents.badge.demo": "Demo",
  "documents.badge.local": "Local",
  "documents.details.title": "Document details",
  "documents.ingestionNote":
    "Ingestion settings are per upload: {size}-token chunks with {overlap}-token overlap. Token counts are approximated at ~4 characters per token.",
  "documents.inspectChunks": "Inspect retrieved chunks",
  "documents.notIndexed": "Not chunked yet",
  "documents.uploadModal.dropTitle": "Drop PDF or Markdown files here",
  "documents.uploadModal.dropHint":
    "Or browse from your machine — up to 50 MB per file.",
  "documents.uploadModal.note":
    "Supported formats: PDF, DOCX, TXT and Markdown. Files are parsed by the local backend and never leave this machine.",
  "documents.uploadModal.browse": "Browse files",
  "documents.uploadModal.settings": "Chunking settings for this upload",
  "documents.uploadModal.selectHint": "PDF, DOCX, TXT or Markdown",
  "documents.uploadModal.selected": "Selected file: {name}",
  "documents.miniPipeline.text": "Text",
  "documents.uploadModal.ingest": "Ingest document",
  "documents.uploadModal.ingesting": "Ingesting…",
  "documents.uploadModal.hint":
    "After ingestion you can see the extracted text and every chunk it produced.",

  "backend.offline.title": "Local backend unavailable",
  "backend.offline.body":
    "Make sure the RAG Inspector backend is running locally: cd backend && uvicorn app.main:app --reload",
  "backend.checking": "Checking backend…",
  "backend.demoMode":
    "Showing demo documents with mock data while the backend is offline.",

  "detail.back": "Documents",
  "detail.meta": "{type} · {count}",
  "detail.page.singular": "page",
  "detail.page.plural": "pages",
  "detail.chunk.singular": "chunk",
  "detail.chunk.plural": "chunks",
  "detail.tab.overview": "Overview",
  "detail.tab.text": "Extracted Text",
  "detail.tab.chunks": "Chunks",
  "detail.ingest.title": "Ingestion pipeline",
  "detail.ingest.upload.label": "Upload",
  "detail.ingest.upload.why":
    "The file reached the local backend. Nothing was sent to any external API.",
  "detail.ingest.extract.label": "Extract",
  "detail.ingest.extract.why":
    "The model cannot search your PDF directly. We first extract its text so the content can be processed by the pipeline.",
  "detail.ingest.clean.label": "Clean",
  "detail.ingest.clean.why":
    "Extraction leaves formatting noise behind. Cleaning removes it without touching the actual content.",
  "detail.ingest.chunk.label": "Chunk",
  "detail.ingest.chunk.why":
    "The document is divided into retrievable pieces — these chunks will later become vectors.",
  "detail.ingest.ready.label": "Ready",
  "detail.ingest.ready.why":
    "The document is fully processed. Embeddings and retrieval will build on these exact chunks.",
  "detail.cleaning.title": "Cleaning",
  "detail.cleaning.original": "Original characters",
  "detail.cleaning.cleaned": "Cleaned characters",
  "detail.cleaning.removed": "Formatting artifacts removed",
  "detail.text.page": "PAGE {page}",
  "detail.text.whyTitle": "WHY THIS MATTERS",
  "detail.text.whyBody":
    "RAG works with text, not the visual PDF itself. This extracted text is the raw material for cleaning and chunking.",
  "detail.chunks.title": "Chunks",
  "detail.chunks.summary":
    "{total} {unit} · {size}-token chunks · {overlap}-token overlap",
  "detail.chunks.none":
    "Adjust the chunking settings to see how the document splits.",
  "detail.chunk.badge": "CHUNK #{index}",
  "detail.chunk.page": "Page {page}",
  "detail.chunk.pagesRange": "Pages {start} → {end}",
  "detail.chunk.stats": "{tokens} tokens · {characters} characters",
  "detail.chunk.prev": "Previous",
  "detail.chunk.next": "Next",
  "detail.chunk.of": "{current} / {total}",
  "detail.chunk.textLabel": "TEXT",
  "detail.chunk.panelTitle": "Chunk #{index}",
  "detail.chunk.source": "Source",
  "detail.chunk.selectedHint":
    "Select a chunk to inspect it in detail.",
  "detail.chunk.whyTitle": "WHY THIS CHUNK EXISTS",
  "detail.chunk.whyBody":
    "Large documents are split into smaller pieces so retrieval can later find the specific information relevant to a question.",
  "detail.chunking.title": "Chunking",
  "detail.chunking.sizeTip":
    "Target size for each chunk, in approximate tokens (≈ 4 characters per token).",
  "detail.chunking.overlapTip":
    "Text shared between consecutive chunks, so important context is not lost at chunk boundaries.",
  "detail.chunking.applies":
    "Settings re-compute the chunk preview instantly. No embeddings are generated.",
  "detail.chunking.visualTitle": "Document → chunks",
  "detail.chunking.visualHint":
    "The bar is the whole document. Translucent tails show text repeated by the overlap.",
  "detail.overlap.whyTitle": "WHY OVERLAP?",
  "detail.overlap.without": "Without overlap:",
  "detail.overlap.with": "With overlap:",
  "concept.tokenApprox.title": "What is a token?",
  "concept.tokenApprox.body":
    "Models measure text in tokens, not characters — roughly one token per four characters in English. Exact tokenization arrives with the embeddings phase.",

  "learn.description":
    "Retrieval-Augmented Generation, step by step — no hand-waving, no magic.",
  "learn.badge": "Learning mode",
  "learn.hero.statement": "RAG shouldn't be a black box.",
  "learn.hero.body":
    "It is a pipeline. Every step is visible, inspectable and testable. Here is what happens between your question and the answer.",
  "learn.documents.title": "Documents",
  "learn.documents.text":
    "Your knowledge starts with documents. PDFs, markdown files and notes are indexed locally — nothing leaves your machine.",
  "learn.chunking.title": "Chunking",
  "learn.chunking.text":
    "Documents are divided into smaller pieces. Chunks are big enough to hold meaning and small enough to retrieve precisely.",
  "learn.embeddings.title": "Embeddings",
  "learn.embeddings.text":
    "Text is converted into vectors — lists of numbers where similar meanings land close together, even without shared keywords.",
  "learn.vector-search.title": "Vector Search",
  "learn.vector-search.text":
    "Your question becomes a vector too. The system finds the stored chunks that are semantically closest to it.",
  "learn.context.title": "Context",
  "learn.context.text":
    "Relevant chunks are provided to the LLM. This is the moment RAG changes the answer — the model is grounded in your documents.",
  "learn.generation.title": "Generation",
  "learn.generation.text":
    "The LLM generates an answer using that context — locally, and with citations back to the chunks it actually used.",
  "learn.visual.tokensPerChunk": "{size} tokens / chunk",
  "learn.visual.overlap": "{overlap}% overlap",
  "learn.visual.totalChunks": "{total} chunks",
  "learn.visual.contextWindow":
    "{used} / {window} tokens of the context window",
  "learn.visual.samplePrompt": "Answer using only this context. Cite sources…",
  "learn.cta.title": "Ready to see it on your own questions?",
  "learn.cta.body":
    "The Playground runs the same pipeline with visible sources.",
  "learn.cta.action": "Open Playground",

  "notFound.title": "404 — This page is not in the knowledge base",
  "notFound.body":
    "The route you requested could not be retrieved from this application.",
  "notFound.back": "Back to Overview",

  "error.unsupported_type.title": "Unsupported document",
  "error.unsupported_type.body":
    "RAG Inspector currently supports PDF, DOCX, TXT and Markdown files.",
  "error.empty_document.title": "No readable text found",
  "error.empty_document.body":
    "We couldn't extract usable text from this document.",
  "error.invalid_file.title": "Could not parse the file",
  "error.invalid_file.body":
    "The file appears to be corrupt or not a real PDF/DOCX document.",
  "error.too_large.title": "File is too large",
  "error.too_large.body":
    "The document exceeds the 50 MB limit for local processing.",
  "error.invalid_settings.title": "Invalid chunking settings",
  "error.invalid_settings.body":
    "Overlap must be smaller than the chunk size (between 64 and 4,096 tokens).",
  "error.not_found.title": "Document not found",
  "error.not_found.body": "This document no longer exists locally.",
  "error.network.title": "Local backend unavailable",
  "error.network.body":
    "Make sure the RAG Inspector backend is running locally.",
  "error.unknown.title": "Something went wrong",
  "error.unknown.body": "The local backend returned an unexpected error.",

  "emptyPipeline.title": "No documents yet",
  "emptyPipeline.body":
    "Upload a document to see how RAG turns raw files into searchable chunks.",
  "emptyPipeline.future": "Future phases",
  "emptyPipeline.upload": "Upload document",

  "common.embeddings": "Embeddings",
  "common.indexed": "Indexed",
  "common.pending": "Pending",
  "common.dimensions": "Dimensions",
  "common.distance": "Distance",
  "common.collection": "Collection",
  "common.viewVector": "View vector",
  "common.hideVector": "Hide vector",
  "common.status.uploaded": "Uploaded",
  "common.status.extracting": "Extracting",
  "common.status.cleaning": "Cleaning",
  "common.status.chunking": "Chunking",
  "common.status.embedding": "Embedding",
  "common.status.indexing": "Indexing",
  "common.status.error": "Error",

  "nav.vectorStore": "Vector Store",

  "overview.metric.embeddings": "Embeddings",
  "overview.metric.documentsLiveHint": "local backend",
  "overview.metric.chunksLiveHint": "per upload settings",
  "overview.metric.embeddingsHint": "BGE-M3 · local",
  "overview.metric.vectorsLiveHint": "Qdrant · Cosine",
  "overview.vectorStore.title": "Vector Store",
  "overview.vectorStore.vectors": "{count} vectors",
  "overview.vectorStore.dimensions": "{count} dimensions",
  "overview.vectorStore.open": "Open Vector Store",

  "vectorStore.connected": "Connected",
  "vectorStore.disconnected": "Unavailable",

  "detail.tab.embeddings": "Embeddings",
  "detail.ingest.embed.label": "Embed",
  "detail.ingest.embed.why":
    "Every chunk is converted into a vector by the local embedding model — numbers that capture meaning.",
  "detail.ingest.index.label": "Index",
  "detail.ingest.index.why":
    "Vectors land in Qdrant together with their metadata, so retrieval can later find them by meaning.",
  "embeddings.generated": "{embedded} / {total} generated",
  "embeddings.model": "Model",
  "embeddings.vectorStore": "Vector store",
  "embeddings.dimensionsValue": "{count} dimensions",
  "embeddings.listTitle": "Vectors per chunk",
  "embeddings.chunkLabel": "Chunk #{index}",
  "embeddings.flowCaption": "{count} dimensions",
  "embeddings.notIndexed":
    "This chunk is not indexed yet — embed the document first.",
  "embeddings.previewNote":
    "Preview — freshly computed by the local model, not stored.",
  "embeddings.previewing": "Embedding…",
  "embeddings.previewButton": "Compute fresh preview",
  "embeddings.storedVector": "Stored vector",
  "embeddings.dimensionsExplain":
    "Each chunk is represented using {count} numerical values. Together, they form its vector representation.",
  "embeddings.whatTitle": "What is an embedding?",
  "embeddings.whatBody":
    "An embedding converts text into a numerical representation that captures semantic information. Similar meanings tend to produce vectors that are closer together.",
  "embeddings.whyTitle": "Why?",
  "embeddings.whyEmbeddings":
    "Computers cannot directly compare the meaning of paragraphs. Embeddings represent text as vectors so mathematical similarity can be used.",
  "embeddings.whyVectorStore":
    "A vector database stores embeddings together with metadata so relevant information can later be retrieved efficiently.",
  "embeddings.whyCosineTitle": "Why cosine?",
  "embeddings.whyCosine":
    "Cosine similarity compares the direction of vectors rather than their magnitude. It is commonly used to measure semantic similarity between embeddings.",
  "embeddings.dimensionTooltip": "Dimension {index} · {value}",
  "embeddings.heatmapHint":
    "Each cell is one dimension — a view of the numbers, not a semantic map.",
  "embeddings.heatmapTitle": "VECTOR",

  "vectorStore.title": "Vector Store",
  "vectorStore.description":
    "See how your chunks are stored as vectors.",
  "vectorStore.stat.vectors": "Vectors",
  "vectorStore.stat.dimensions": "Dimensions",
  "vectorStore.stat.documents": "Documents",
  "vectorStore.stat.avgChunks": "Avg chunks/document",
  "vectorStore.stat.indexed": "Indexed",
  "vectorStore.empty.title": "No vectors yet",
  "vectorStore.empty.body":
    "Upload a document and RAG Inspector will embed and index every chunk.",
  "vectorStore.offline.title": "Vector store unavailable",
  "vectorStore.offline.body":
    "Start Qdrant locally and try again: docker compose up -d",
  "vectorStore.retry": "Retry connection",
  "vectorStore.browserTitle": "Indexed chunks",
  "vectorStore.browserHint": "Click a vector to inspect it.",
  "vectorStore.pagePosition": "Showing {shown} of {total}",
  "vectorStore.pointPosition": "Chunk #{index} · Page {page}",
  "vectorStore.openDocument": "Open document",
  "vectorStore.space.title": "Semantic Space",
  "vectorStore.space.body":
    "Each point represents a document chunk. The original embeddings contain {dimensions} dimensions. This visualization projects them into 2D so we can visually explore relationships between chunks.",
  "vectorStore.space.method": "Projection: {method} · {shown} of {total} vectors",
  "vectorStore.space.legendChunk": "Each point = 1 chunk",
  "vectorStore.space.legendSame": "Closer points = more similar meaning",
  "vectorStore.space.empty":
    "Index a few chunks to see the semantic space.",

  "documents.retryEmbed": "Retry embeddings",

  "error.vector_store_unavailable.title": "Vector store unavailable",
  "error.vector_store_unavailable.body":
    "Start Qdrant locally and try again.",
  "error.embedding_model_unavailable.title": "Embedding model unavailable",
  "error.embedding_model_unavailable.body":
    "Make sure the local embedding model can be loaded.",
  "error.embedding_failed.title": "Embedding failed",
  "error.embedding_failed.body":
    "The document chunks were created, but their vectors could not be generated.",
  "error.already_running.title": "Already processing",
  "error.already_running.body":
    "This document is already being processed.",
  "error.collection_mismatch.title": "Dimension mismatch",
  "error.collection_mismatch.body":
    "The Qdrant collection was created with a different embedding model. Delete the collection or switch back to index again.",
  "error.validation.title": "Invalid query",
  "error.validation.body":
    "Check the query text, Top K (1–20) and threshold (0–1) values.",

  "retrieval.liveBadge": "Live retrieval",
  "retrieval.search": "Search",
  "retrieval.searching": "Searching…",
  "retrieval.placeholder": "Ask something about your documents…",
  "retrieval.queryLabel": "Question",
  "retrieval.topK": "Top K",
  "retrieval.threshold": "Similarity threshold",
  "retrieval.thresholdHint":
    "Threshold filters retrieved results below this similarity score.",
  "retrieval.document": "Document",
  "retrieval.allDocuments": "All documents",
  "retrieval.resultsTitle": "Retrieved Chunks",
  "retrieval.resultsCount": "{shown} of {total} indexed chunks matched",
  "retrieval.corpusSize": "{count} indexed chunks",
  "retrieval.cosineSimilarity": "Cosine similarity",
  "retrieval.scoreIsNotConfidence":
    "This is a retrieval similarity score — not a confidence score, correctness or probability.",
  "retrieval.similarityWhatTitle": "What does similarity mean?",
  "retrieval.similarityWhatBody":
    "Cosine similarity measures how closely two vectors point in the same direction in embedding space. A higher similarity means the retrieved chunk is more semantically related to the query according to the embedding model — but similarity does not guarantee that the chunk contains the correct answer.",
  "retrieval.whyRetrieved": "Why was this retrieved?",
  "retrieval.whyRetrievedBody":
    "This chunk was retrieved because its embedding has high cosine similarity to the query embedding. The score ({score}) reflects semantic proximity in the embedding space. It does not guarantee that this chunk contains the correct answer.",
  "retrieval.viewChunk": "View chunk",
  "retrieval.tokens": "{count} tokens",
  "retrieval.queryEmbeddingTitle": "Query embedding",
  "retrieval.model": "Model",
  "retrieval.recentQueries": "Recent queries",
  "retrieval.noIndexedDocuments.title": "No indexed documents yet",
  "retrieval.noIndexedDocuments.body":
    "Upload a document to build your vector store.",
  "retrieval.noResults.title": "No chunks matched this query.",
  "retrieval.noResults.body":
    "Try: a different question · a lower similarity threshold · searching all documents.",
  "retrieval.flow.query": "Question",
  "retrieval.flow.embedding": "Query embedding",
  "retrieval.flow.search": "Qdrant search",
  "retrieval.flow.similarity": "Cosine similarity",
  "retrieval.flow.ranking": "Ranking · Top-K",
  "retrieval.flowTitle": "How retrieval works",
  "retrieval.spaceTitle": "Where this query lands",
  "retrieval.spaceBody":
    "The star is your query embedding. Highlighted points are the retrieved chunks — scores come from Qdrant, not from 2D distances.",
  "retrieval.legendQuery": "Query",
  "retrieval.legendRetrieved": "Retrieved (Top-K)",
  "retrieval.legendOther": "Other chunks",
  "retrieval.stage.loadingModel": "Loading embedding model for the first query…",
  "retrieval.stage.embedding": "Embedding query with BGE-M3…",
  "retrieval.stage.searching": "Searching Qdrant…",

  "playground.retrievalError": "The run failed:",

  "playground.localLlmReady": "Local LLM ready",
  "playground.localLlmUnavailable": "Local LLM unavailable",
  "playground.llmUnavailableBody":
    "Ollama is not reachable or the configured model is not installed.",
  "playground.llmHint": "Start it with: ollama serve — then: ollama pull {model}",
  "playground.modelNotInstalled":
    "Model “{model}” is not installed locally. Run: ollama pull {model}",
  "playground.model": "Model",
  "playground.modelDefault": "Configured default",
  "playground.temperature": "Temperature",
  "playground.temperatureInfo":
    "Controls how much the model varies its wording. It does not control factuality.",
  "playground.generating": "Generating with {model}…",
  "playground.stop": "Stop",
  "playground.llmChip": "LOCAL LLM · Ollama",

  "playground.answer.title": "Answer",
  "playground.answer.groundingNote":
    "This answer was generated using the retrieved context shown below.",
  "playground.answer.noCitation":
    "No explicit source citation was detected in this answer.",
  "playground.answer.empty": "The model did not return an answer.",
  "playground.sources.title": "Sources",
  "playground.sources.verified": "Verified source",
  "playground.sources.unresolvedTitle": "Unresolved citation",
  "playground.sources.unresolvedBody":
    "The model cited {numbers} — identifiers that do not exist in this run's context. They are shown but not treated as real sources.",
  "playground.sources.open": "Open chunk",
  "playground.prompt.title": "Prompt Inspector",
  "playground.prompt.description":
    "The exact text sent to Ollama for this run — not an example.",
  "playground.prompt.system": "System instructions",
  "playground.prompt.context": "Context",
  "playground.prompt.user": "User question",
  "playground.prompt.view": "Show actual prompt",
  "playground.prompt.hide": "Hide prompt",
  "playground.runInspector.title": "Run Inspector",
  "playground.run.query": "Question",
  "playground.run.retrieval": "Retrieval",
  "playground.run.topK": "Top K",
  "playground.run.results": "Results",
  "playground.run.corpus": "Indexed chunks",
  "playground.run.retrievalTime": "Retrieval time",
  "playground.run.context": "Context",
  "playground.run.retrieved": "Retrieved chunks",
  "playground.run.included": "Included chunks",
  "playground.run.estimated": "Estimated tokens",
  "playground.run.prompt": "Prompt",
  "playground.run.model": "Model",
  "playground.run.temperature": "Temperature",
  "playground.run.generation": "Generation",
  "playground.run.generationTime": "Generation time",
  "playground.run.completionTokens": "Completion tokens",
  "playground.run.promptTokens": "Prompt tokens",
  "playground.run.tokensPerSecond": "Tokens / second",
  "playground.run.notReported": "not reported by Ollama",
  "playground.run.ms": "{ms} ms",
  "playground.run.s": "{s} s",
  "playground.ragVsGen.title": "Retrieval vs generation",
  "playground.ragVsGen.body":
    "Retrieval answers which chunks are relevant — mathematics over vectors. Generation answers how to phrase the answer — the local LLM writes it. They are separate steps, with separate failure modes.",
  "playground.noDocuments.title": "No indexed documents available.",
  "playground.noDocuments.body":
    "Upload and index a document before running RAG.",

  "retrieval.useInPlayground": "Use in Playground",

  "error.llm_unavailable.title": "Local LLM unavailable",
  "error.llm_unavailable.body":
    "Ollama is not reachable at the configured URL.",
  "error.llm_model_not_found.title": "Model not installed",
  "error.llm_model_not_found.body":
    "The model is not available locally. Pull it with ollama pull — RAG Inspector never downloads models for you.",
  "error.llm_timeout.title": "Generation timed out",
  "error.llm_timeout.body":
    "Ollama exceeded the configured timeout. Try a smaller model or a shorter context.",
  "error.generation_failed.title": "Generation failed",
  "error.generation_failed.body":
    "Ollama reported an error while generating.",
  "error.no_indexed_documents.title": "No indexed documents available.",
  "error.no_indexed_documents.body":
    "Upload and index a document before running RAG.",
  "error.invalid_temperature.title": "Invalid temperature",
  "error.invalid_temperature.body": "Temperature must be between 0 and 2.",
  "error.cancelled.title": "Generation stopped",
  "error.cancelled.body": "You cancelled this run."
} as const;

export type TranslationKey = keyof typeof en;
export type TranslationDictionary = Record<TranslationKey, string>;
