import type { TranslationDictionary } from "./en";

export const es: TranslationDictionary = {
  "app.name": "RAG Inspector",
  "app.tagline": "Visual RAG playground",

  "common.skipToContent": "Saltar al contenido",
  "common.local": "Local",
  "common.localMode": "MODO LOCAL",
  "common.localBody":
    "Los documentos se procesan con el backend local de RAG Inspector. No se necesita ninguna API externa de IA.",
  "common.retry": "Reintentar",
  "common.close": "Cerrar",
  "common.closeNav": "Cerrar navegación",
  "common.comingSoon": "Próximamente",
  "common.running": "En ejecución",
  "common.step": "paso {index} de {total}",
  "common.demoRun": "Demo",
  "common.demoData": "Datos de demo",
  "common.pages": "Páginas",
  "common.words": "Palabras",
  "common.characters": "Caracteres",
  "common.chunks": "Chunks",
  "common.tokens": "Tokens",
  "common.overlap": "Superposición",
  "common.chunkSize": "Tamaño de chunk",
  "common.status.ready": "Listo",
  "common.status.processing": "Procesando",
  "common.status.failed": "Error",
  "common.table.query": "Consulta",
  "common.table.retrievalScore": "Score de recuperación",
  "common.table.chunks": "Chunks",
  "common.table.responseTime": "Tiempo de respuesta",
  "common.table.ran": "Ejecutada",
  "common.table.document": "Documento",
  "common.table.type": "Tipo",
  "common.table.pages": "Páginas",
  "common.table.added": "Añadido",
  "common.expandSidebar": "Expandir barra lateral",
  "common.collapseSidebar": "Colapsar barra lateral",
  "common.lightMode": "Cambiar a modo claro",
  "common.darkMode": "Cambiar a modo oscuro",
  "common.language": "Idioma",

  "nav.overview": "Resumen",
  "nav.mainLabel": "Navegación principal",
  "nav.documents": "Documentos",
  "nav.playground": "Playground",
  "nav.retrieval": "Recuperación",
  "nav.evaluation": "Evaluación",
  "nav.learn": "Aprender",
  "nav.howRagWorks": "Cómo funciona RAG",
  "nav.chunking": "Fragmentación",
  "nav.embeddings": "Embeddings",
  "nav.vectorSearch": "Búsqueda vectorial",

  "overview.description":
    "Entendé qué pasa entre una pregunta y una respuesta generada por IA.",
  "overview.badgeLocal": "Modo local",
  "overview.metric.documents": "Documentos",
  "overview.metric.chunks": "Chunks",
  "overview.metric.vectors": "Vectores",
  "overview.metric.queries": "Consultas",
  "overview.metric.documentsHint": "+2 esta semana",
  "overview.metric.chunksHint": "512 tokens · 15% de superposición",
  "overview.metric.vectorsHint": "BGE-M3 · 1.024 dimensiones",
  "overview.metric.queriesHint": "38 hoy",
  "overview.pipeline.title": "Pipeline RAG",
  "overview.pipeline.description":
    "Toda respuesta recorre el mismo camino. Pasá el cursor o hacé clic en una etapa para verla en detalle.",
  "overview.pipeline.stageLabel": "Etapa del pipeline",
  "overview.pipeline.legend.real": "Disponible hoy",
  "overview.pipeline.legend.next": "Fase actual",
  "overview.pipeline.legend.planned": "Planificada",
  "overview.recent.title": "Consultas recientes",
  "overview.recent.description":
    "Las últimas preguntas ejecutadas sobre el conocimiento indexado.",

  "pipeline.stages.documents.label": "Documentos",
  "pipeline.stages.documents.description":
    "Tu conocimiento empieza como archivos reales: PDF, markdown, notas. Los subís y se procesan localmente.",
  "pipeline.stages.chunking.label": "Fragmentación",
  "pipeline.stages.chunking.description":
    "Los documentos se dividen en chunks más pequeños y superpuestos, para que el sistema pueda recuperar fragmentos precisos en lugar de archivos enteros.",
  "pipeline.stages.embeddings.label": "Embeddings",
  "pipeline.stages.embeddings.description":
    "Cada chunk se convierte en un vector: una lista de números que captura su significado, no solo sus palabras clave.",
  "pipeline.stages.vector-store.label": "Vector Store",
  "pipeline.stages.vector-store.description":
    "Los vectores se guardan en un índice que encuentra fragmentos semánticamente similares, a escala y localmente en tu máquina.",
  "pipeline.stages.retrieval.label": "Recuperación",
  "pipeline.stages.retrieval.description":
    "Encuentra los chunks más relevantes para la pregunta comparando su embedding contra los vectores almacenados.",
  "pipeline.stages.context.label": "Contexto",
  "pipeline.stages.context.description":
    "Los chunks recuperados se ensamblan, con sus fuentes, en el prompt que el modelo realmente ve.",
  "pipeline.stages.llm.label": "LLM local",
  "pipeline.stages.llm.description":
    "Un modelo que corre localmente con Ollama genera una respuesta basada en el contexto provisto.",
  "pipeline.stages.answer.label": "Respuesta",
  "pipeline.stages.answer.description":
    "La respuesta llega con sus fuentes: basada en tus documentos, trazable e inspeccionable.",
  "pipeline.stages.question.label": "Pregunta",
  "pipeline.stages.question.description":
    "Hacés una pregunta sobre tu base de conocimiento.",
  "pipeline.stages.prompt.label": "Prompt",
  "pipeline.stages.prompt.description":
    "El contexto y la pregunta se ensamblan en el prompt exacto que recibe el modelo — completamente inspeccionable.",
  "pipeline.stages.sources.label": "Fuentes",
  "pipeline.stages.sources.description":
    "Las citas en la respuesta apuntan a los chunks específicos de los que salieron.",

  "playground.title": "Playground",
  "playground.description":
    "Hacé preguntas e inspeccioná cómo RAG encuentra la respuesta.",
  "playground.newRun": "Nueva ejecución",
  "playground.placeholder": "Preguntale a tu base de conocimiento…",
  "playground.hint": "Enter para ejecutar · Shift+Enter para un salto de línea",
  "playground.ask": "Preguntar",
  "playground.running": "Ejecutando…",
  "playground.empty.title": "RAG no debería ser una caja negra.",
  "playground.empty.body":
    "Ejecutá una pregunta y mirá cómo viaja por embedding, recuperación, contexto, prompt y generación local.",
  "playground.run.title": "Ejecución del pipeline",
  "playground.questionEcho": "P: {question}",

  "retrieval.title": "Retrieval Inspector",
  "retrieval.description":
    "Vé exactamente qué chunks recupera tu sistema RAG.",
  "retrieval.chunksTitle": "Chunks recuperados",
  "retrieval.similarity": "Similitud",
  "retrieval.rank": "Puesto {rank}",

  "evaluation.title": "Evaluación",
  "evaluation.description": "Medí la calidad de tu pipeline RAG.",
  "evaluation.badge": "Métricas de demo",
  "evaluation.notice":
    "Estas son métricas hipotéticas con datos simulados. Las evaluaciones reales (scoring estilo RAGAS, golden datasets) llegan con la integración del pipeline.",
  "evaluation.metric.answer-relevance.label": "Relevancia de la respuesta",
  "evaluation.metric.answer-relevance.description":
    "¿La respuesta generada va al punto de la pregunta?",
  "evaluation.metric.context-relevance.label": "Relevancia del contexto",
  "evaluation.metric.context-relevance.description":
    "¿Los chunks recuperados son relevantes para la pregunta?",
  "evaluation.metric.faithfulness.label": "Fidelidad",
  "evaluation.metric.faithfulness.description":
    "¿Cada afirmación de la respuesta está respaldada por el contexto?",
  "evaluation.metric.retrieval-precision.label": "Precisión de recuperación",
  "evaluation.metric.retrieval-precision.description":
    "¿Cuántos chunks recuperados se usaron realmente?",
  "evaluation.runs.title": "Consultas evaluadas",
  "evaluation.runs.description":
    "{passed} de {total} preguntas pasaron todas las verificaciones en la última demo.",
  "evaluation.table.expected": "Esperado",
  "evaluation.table.retrieved": "Recuperado",
  "evaluation.table.score": "Score",
  "evaluation.table.status": "Estado",
  "evaluation.status.pass": "OK",
  "evaluation.status.warn": "Revisar",
  "evaluation.status.fail": "Falló",

  "documents.title": "Documentos",
  "documents.description":
    "Administrá el conocimiento que usa tu pipeline RAG.",
  "documents.upload": "Subir documento",
  "documents.search.label": "Buscar documentos",
  "documents.search.placeholder": "Buscar documentos…",
  "documents.count": "{shown} de {total} documentos",
  "documents.caption": "Documentos indexados",
  "documents.noResults.title": "Ningún documento coincide con tu búsqueda",
  "documents.noResults.body":
    "Nada indexado contiene “{term}”. Probá con otro término.",
  "documents.noResults.clear": "Limpiar búsqueda",
  "documents.badge.demo": "Demo",
  "documents.badge.local": "Local",
  "documents.details.title": "Detalles del documento",
  "documents.ingestionNote":
    "La configuración de ingesta es por subida: chunks de {size} tokens con {overlap} tokens de superposición. Los tokens se aproximan con ~4 caracteres por token.",
  "documents.inspectChunks": "Inspeccionar chunks recuperados",
  "documents.notIndexed": "Aún sin fragmentar",
  "documents.uploadModal.dropTitle": "Soltá aquí un archivo PDF o Markdown",
  "documents.uploadModal.dropHint":
    "O elegilo desde tu máquina — hasta 50 MB por archivo.",
  "documents.uploadModal.note":
    "Formatos soportados: PDF, DOCX, TXT y Markdown. El backend local analiza los archivos y nunca salen de esta máquina.",
  "documents.uploadModal.browse": "Elegir archivos",
  "documents.uploadModal.settings": "Configuración de fragmentación para esta subida",
  "documents.uploadModal.selectHint": "PDF, DOCX, TXT o Markdown",
  "documents.uploadModal.selected": "Archivo seleccionado: {name}",
  "documents.miniPipeline.text": "Texto",
  "documents.uploadModal.ingest": "Ingerir documento",
  "documents.uploadModal.ingesting": "Ingiriendo…",
  "documents.uploadModal.hint":
    "Después de la ingesta vas a poder ver el texto extraído y cada uno de los chunks generados.",

  "backend.offline.title": "El backend local no está disponible",
  "backend.offline.body":
    "Asegurate de tener el backend de RAG Inspector corriendo en local: cd backend && uvicorn app.main:app --reload",
  "backend.checking": "Verificando backend…",
  "backend.demoMode":
    "Mostrando documentos de demo con datos simulados mientras el backend está fuera de línea.",

  "detail.back": "Documentos",
  "detail.meta": "{type} · {count}",
  "detail.page.singular": "página",
  "detail.page.plural": "páginas",
  "detail.chunk.singular": "chunk",
  "detail.chunk.plural": "chunks",
  "detail.tab.overview": "Resumen",
  "detail.tab.text": "Texto extraído",
  "detail.tab.chunks": "Chunks",
  "detail.ingest.title": "Pipeline de ingesta",
  "detail.ingest.upload.label": "Subida",
  "detail.ingest.upload.why":
    "El archivo llegó al backend local. No se envió nada a ninguna API externa.",
  "detail.ingest.extract.label": "Extracción",
  "detail.ingest.extract.why":
    "El modelo no puede buscar directamente en tu PDF. Primero extraemos su texto para que el pipeline pueda procesar el contenido.",
  "detail.ingest.clean.label": "Limpieza",
  "detail.ingest.clean.why":
    "La extracción deja ruido de formato. La limpieza lo elimina sin tocar el contenido real.",
  "detail.ingest.chunk.label": "Fragmentación",
  "detail.ingest.chunk.why":
    "El documento se divide en fragmentos recuperables: estos chunks luego se convertirán en vectores.",
  "detail.ingest.ready.label": "Listo",
  "detail.ingest.ready.why":
    "El documento quedó completamente procesado. Embeddings y recuperación se construirán sobre estos mismos chunks.",
  "detail.cleaning.title": "Limpieza",
  "detail.cleaning.original": "Caracteres originales",
  "detail.cleaning.cleaned": "Caracteres limpiados",
  "detail.cleaning.removed": "Artefactos de formato eliminados",
  "detail.text.page": "PÁGINA {page}",
  "detail.text.whyTitle": "POR QUÉ IMPORTA",
  "detail.text.whyBody":
    "RAG trabaja con texto, no con el PDF visual. Este texto extraído es la materia prima para la limpieza y la fragmentación.",
  "detail.chunks.title": "Chunks",
  "detail.chunks.summary":
    "{total} {unit} · chunks de {size} tokens · {overlap} tokens de superposición",
  "detail.chunks.none":
    "Ajustá la configuración de fragmentación para ver cómo se divide el documento.",
  "detail.chunk.badge": "CHUNK #{index}",
  "detail.chunk.page": "Página {page}",
  "detail.chunk.pagesRange": "Páginas {start} → {end}",
  "detail.chunk.stats": "{tokens} tokens · {characters} caracteres",
  "detail.chunk.prev": "Anterior",
  "detail.chunk.next": "Siguiente",
  "detail.chunk.of": "{current} / {total}",
  "detail.chunk.textLabel": "TEXTO",
  "detail.chunk.panelTitle": "Chunk #{index}",
  "detail.chunk.source": "Fuente",
  "detail.chunk.selectedHint":
    "Seleccioná un chunk para inspeccionarlo en detalle.",
  "detail.chunk.whyTitle": "POR QUÉ EXISTE ESTE CHUNK",
  "detail.chunk.whyBody":
    "Los documentos grandes se dividen en fragmentos más chicos para que la recuperación pueda encontrar después la información precisa para cada pregunta.",
  "detail.chunking.title": "Fragmentación",
  "detail.chunking.sizeTip":
    "Tamaño objetivo de cada chunk, en tokens aproximados (≈ 4 caracteres por token).",
  "detail.chunking.overlapTip":
    "Texto compartido entre chunks consecutivos, para que el contexto no se pierda en las fronteras.",
  "detail.chunking.applies":
    "La configuración recalcula la vista previa al instante. No se generan embeddings.",
  "detail.chunking.visualTitle": "Documento → chunks",
  "detail.chunking.visualHint":
    "La barra es todo el documento. Las colas translúcidas muestran el texto repetido por la superposición.",
  "detail.overlap.whyTitle": "¿POR QUÉ SUPERPOSICIÓN?",
  "detail.overlap.without": "Sin superposición:",
  "detail.overlap.with": "Con superposición:",
  "concept.tokenApprox.title": "¿Qué es un token?",
  "concept.tokenApprox.body":
    "Los modelos miden el texto en tokens, no en caracteres: aproximadamente un token cada cuatro caracteres en inglés. La tokenización exacta llega con la fase de embeddings.",

  "learn.description":
    "Retrieval-Augmented Generation, paso a paso: sin humo, sin magia.",
  "learn.badge": "Modo aprendizaje",
  "learn.hero.statement": "RAG no debería ser una caja negra.",
  "learn.hero.body":
    "Es un pipeline. Cada paso es visible, inspeccionable y testeable. Esto es lo que pasa entre tu pregunta y la respuesta.",
  "learn.documents.title": "Documentos",
  "learn.documents.text":
    "Tu conocimiento empieza con documentos. PDFs, archivos markdown y notas se indexan localmente: nada sale de tu máquina.",
  "learn.chunking.title": "Fragmentación",
  "learn.chunking.text":
    "Los documentos se dividen en fragmentos más chicos: lo suficientemente grandes para tener significado y lo suficientemente pequeños para recuperar con precisión.",
  "learn.embeddings.title": "Embeddings",
  "learn.embeddings.text":
    "El texto se convierte en vectores: listas de números donde significados parecidos quedan cerca, incluso sin compartir palabras clave.",
  "learn.vector-search.title": "Búsqueda vectorial",
  "learn.vector-search.text":
    "Tu pregunta también se convierte en un vector. El sistema busca los chunks almacenados más cercanos semánticamente.",
  "learn.context.title": "Contexto",
  "learn.context.text":
    "Los chunks relevantes se le pasan al LLM. Este es el momento en que RAG cambia la respuesta: el modelo se apoya en tus documentos.",
  "learn.generation.title": "Generación",
  "learn.generation.text":
    "El LLM genera una respuesta usando ese contexto: localmente, y con citas a los chunks que realmente usó.",
  "learn.visual.tokensPerChunk": "{size} tokens por chunk",
  "learn.visual.overlap": "{overlap}% de superposición",
  "learn.visual.totalChunks": "{total} chunks",
  "learn.visual.contextWindow":
    "{used} / {window} tokens de la ventana de contexto",
  "learn.visual.samplePrompt": "Respondé usando solo este contexto. Citá las fuentes…",
  "learn.cta.title": "¿Listo para verlo con tus propias preguntas?",
  "learn.cta.body":
    "El Playground ejecuta el mismo pipeline con fuentes visibles.",
  "learn.cta.action": "Abrir Playground",

  "notFound.title": "404 — Esta página no está en la base de conocimiento",
  "notFound.body":
    "La ruta que pediste no se pudo recuperar de esta aplicación.",
  "notFound.back": "Volver al Resumen",

  "error.unsupported_type.title": "Documento no soportado",
  "error.unsupported_type.body":
    "RAG Inspector actualmente soporta archivos PDF, DOCX, TXT y Markdown.",
  "error.empty_document.title": "No se encontró texto legible",
  "error.empty_document.body":
    "No pudimos extraer texto utilizable de este documento.",
  "error.invalid_file.title": "No se pudo analizar el archivo",
  "error.invalid_file.body":
    "El archivo parece estar dañado o no es un documento PDF/DOCX válido.",
  "error.too_large.title": "El archivo es muy grande",
  "error.too_large.body":
    "El documento supera el límite de 50 MB para el procesamiento local.",
  "error.invalid_settings.title": "Configuración de fragmentación inválida",
  "error.invalid_settings.body":
    "La superposición debe ser menor al tamaño de chunk (entre 64 y 4.096 tokens).",
  "error.not_found.title": "Documento no encontrado",
  "error.not_found.body": "Este documento ya no existe localmente.",
  "error.network.title": "El backend local no está disponible",
  "error.network.body":
    "Asegurate de tener el backend de RAG Inspector corriendo en local.",
  "error.unknown.title": "Algo salió mal",
  "error.unknown.body": "El backend local devolvió un error inesperado.",

  "emptyPipeline.title": "Todavía no hay documentos",
  "emptyPipeline.body":
    "Subí un documento para ver cómo RAG convierte archivos crudos en chunks buscables.",
  "emptyPipeline.future": "Próximas fases",
  "emptyPipeline.upload": "Subir documento",

  "common.embeddings": "Embeddings",
  "common.indexed": "Indexado",
  "common.pending": "Pendiente",
  "common.dimensions": "Dimensiones",
  "common.distance": "Distancia",
  "common.collection": "Colección",
  "common.viewVector": "Ver vector",
  "common.hideVector": "Ocultar vector",
  "common.status.uploaded": "Subido",
  "common.status.extracting": "Extrayendo",
  "common.status.cleaning": "Limpiando",
  "common.status.chunking": "Fragmentando",
  "common.status.embedding": "Generando embeddings",
  "common.status.indexing": "Indexando",
  "common.status.error": "Error",

  "nav.vectorStore": "Vector Store",

  "overview.metric.embeddings": "Embeddings",
  "overview.metric.documentsLiveHint": "backend local",
  "overview.metric.chunksLiveHint": "según configuración de subida",
  "overview.metric.embeddingsHint": "BGE-M3 · local",
  "overview.metric.vectorsLiveHint": "Qdrant · Cosine",
  "overview.vectorStore.title": "Vector Store",
  "overview.vectorStore.vectors": "{count} vectores",
  "overview.vectorStore.dimensions": "{count} dimensiones",
  "overview.vectorStore.open": "Abrir Vector Store",

  "vectorStore.connected": "Conectado",
  "vectorStore.disconnected": "No disponible",

  "detail.tab.embeddings": "Embeddings",
  "detail.ingest.embed.label": "Embedding",
  "detail.ingest.embed.why":
    "Cada chunk se convierte en un vector mediante el modelo de embeddings local: números que capturan el significado.",
  "detail.ingest.index.label": "Indexación",
  "detail.ingest.index.why":
    "Los vectores se guardan en Qdrant junto con sus metadatos, para que la recuperación pueda encontrarlos por significado en la Fase 4.",
  "embeddings.generated": "{embedded} / {total} generados",
  "embeddings.model": "Modelo",
  "embeddings.vectorStore": "Almacén de vectores",
  "embeddings.dimensionsValue": "{count} dimensiones",
  "embeddings.listTitle": "Vectores por chunk",
  "embeddings.chunkLabel": "Chunk #{index}",
  "embeddings.flowCaption": "{count} dimensiones",
  "embeddings.notIndexed":
    "Este chunk todavía no está indexado: primero generá los embeddings del documento.",
  "embeddings.previewNote":
    "Vista previa — calculada por el modelo local, no almacenada.",
  "embeddings.previewing": "Calculando embedding…",
  "embeddings.previewButton": "Calcular vista previa",
  "embeddings.storedVector": "Vector almacenado",
  "embeddings.dimensionsExplain":
    "Cada chunk se representa con {count} valores numéricos. En conjunto forman su representación vectorial.",
  "embeddings.whatTitle": "¿Qué es un embedding?",
  "embeddings.whatBody":
    "Un embedding convierte el texto en una representación numérica que captura información semántica. Los textos con significados similares tienden a producir vectores más cercanos.",
  "embeddings.whyTitle": "¿Por qué?",
  "embeddings.whyEmbeddings":
    "Las computadoras no pueden comparar directamente el significado de dos párrafos. Los embeddings representan el texto como vectores, y así se puede usar similitud matemática.",
  "embeddings.whyVectorStore":
    "Una base de datos vectorial guarda embeddings junto con sus metadatos, para luego recuperar la información relevante de forma eficiente.",
  "embeddings.whyCosineTitle": "¿Por qué coseno?",
  "embeddings.whyCosine":
    "La similitud coseno compara la dirección de los vectores, no su magnitud. Es la medida habitual para similitud semántica entre embeddings.",
  "embeddings.dimensionTooltip": "Dimensión {index} · {value}",
  "embeddings.heatmapHint":
    "Cada celda es una dimensión — una vista de los números, no un mapa semántico.",
  "embeddings.heatmapTitle": "VECTOR",

  "vectorStore.title": "Vector Store",
  "vectorStore.description":
    "Vé cómo se almacenan tus chunks como vectores.",
  "vectorStore.stat.vectors": "Vectores",
  "vectorStore.stat.dimensions": "Dimensiones",
  "vectorStore.stat.documents": "Documentos",
  "vectorStore.stat.avgChunks": "Chunks promedio por documento",
  "vectorStore.stat.indexed": "Indexado",
  "vectorStore.empty.title": "Todavía no hay vectores",
  "vectorStore.empty.body":
    "Subí un documento y RAG Inspector generará e indexará los embeddings de cada chunk.",
  "vectorStore.offline.title": "Almacén de vectores no disponible",
  "vectorStore.offline.body":
    "Iniciá Qdrant en local y reintentá: docker compose up -d",
  "vectorStore.retry": "Reintentar conexión",
  "vectorStore.browserTitle": "Chunks indexados",
  "vectorStore.browserHint": "Hacé clic en un vector para inspeccionarlo.",
  "vectorStore.pagePosition": "Mostrando {shown} de {total}",
  "vectorStore.pointPosition": "Chunk #{index} · Página {page}",
  "vectorStore.openDocument": "Abrir documento",
  "vectorStore.space.title": "Espacio semántico",
  "vectorStore.space.body":
    "Cada punto representa un fragmento del documento. Los embeddings originales contienen {dimensions} dimensiones. Esta visualización los proyecta a 2D para explorar visualmente la relación entre los fragmentos.",
  "vectorStore.space.method": "Proyección: {method} · {shown} de {total} vectores",
  "vectorStore.space.legendChunk": "Cada punto = 1 chunk",
  "vectorStore.space.legendSame": "Puntos más cercanos = significados más parecidos",
  "vectorStore.space.empty":
    "Indexá algunos chunks para ver el espacio semántico.",

  "documents.retryEmbed": "Reintentar embeddings",

  "error.vector_store_unavailable.title": "Almacén de vectores no disponible",
  "error.vector_store_unavailable.body":
    "Iniciá Qdrant en local y reintentá.",
  "error.embedding_model_unavailable.title": "Modelo de embeddings no disponible",
  "error.embedding_model_unavailable.body":
    "Asegurate de que el modelo de embeddings local pueda cargarse.",
  "error.embedding_failed.title": "Fallo de embeddings",
  "error.embedding_failed.body":
    "Los chunks del documento se crearon, pero no se pudieron generar sus vectores.",
  "error.already_running.title": "Ya se está procesando",
  "error.already_running.body":
    "Este documento ya está siendo procesado.",
  "error.collection_mismatch.title": "Dimensiones que no coinciden",
  "error.collection_mismatch.body":
    "La colección de Qdrant se creó con un modelo de embeddings distinto. Borrá la colección o volvé al modelo anterior para indexar de nuevo.",
  "error.validation.title": "Consulta inválida",
  "error.validation.body":
    "Revisá el texto de la consulta, el Top K (1–20) y el umbral (0–1).",

  "retrieval.liveBadge": "Búsqueda real",
  "retrieval.search": "Buscar",
  "retrieval.searching": "Buscando…",
  "retrieval.placeholder": "Preguntá algo sobre tus documentos…",
  "retrieval.queryLabel": "Pregunta",
  "retrieval.topK": "Top K",
  "retrieval.threshold": "Umbral de similitud",
  "retrieval.thresholdHint":
    "El umbral filtra los resultados por debajo de este score de similitud.",
  "retrieval.document": "Documento",
  "retrieval.allDocuments": "Todos los documentos",
  "retrieval.resultsTitle": "Chunks recuperados",
  "retrieval.resultsCount": "{shown} de {total} chunks indexados coincidieron",
  "retrieval.corpusSize": "{count} chunks indexados",
  "retrieval.cosineSimilarity": "Similitud coseno",
  "retrieval.scoreIsNotConfidence":
    "Esto es un score de similitud de recuperación — no un score de confianza, de corrección ni una probabilidad.",
  "retrieval.similarityWhatTitle": "¿Qué significa la similitud?",
  "retrieval.similarityWhatBody":
    "La similitud coseno mide cuán parecida es la dirección de dos vectores en el espacio de embeddings. Una similitud más alta indica que el chunk recuperado está más relacionado semánticamente con la consulta según el modelo de embeddings — pero la similitud no garantiza que el chunk contenga la respuesta correcta.",
  "retrieval.whyRetrieved": "¿Por qué se recuperó esto?",
  "retrieval.whyRetrievedBody":
    "Este chunk se recuperó porque su embedding tiene una alta similitud coseno con el embedding de la consulta. El score ({score}) refleja cercanía semántica en el espacio de embeddings. No garantiza que este chunk contenga la respuesta correcta.",
  "retrieval.viewChunk": "Ver chunk",
  "retrieval.tokens": "{count} tokens",
  "retrieval.queryEmbeddingTitle": "Embedding de la consulta",
  "retrieval.model": "Modelo",
  "retrieval.recentQueries": "Consultas recientes",
  "retrieval.noIndexedDocuments.title": "Todavía no hay documentos indexados",
  "retrieval.noIndexedDocuments.body":
    "Subí un documento para construir tu vector store.",
  "retrieval.noResults.title": "Ningún chunk coincidió con esta consulta.",
  "retrieval.noResults.body":
    "Probá: otra pregunta · un umbral de similitud más bajo · buscar en todos los documentos.",
  "retrieval.flow.query": "Pregunta",
  "retrieval.flow.embedding": "Embedding de consulta",
  "retrieval.flow.search": "Búsqueda en Qdrant",
  "retrieval.flow.similarity": "Similitud coseno",
  "retrieval.flow.ranking": "Ranking · Top-K",
  "retrieval.flowTitle": "Cómo funciona la recuperación",
  "retrieval.spaceTitle": "Dónde cae esta consulta",
  "retrieval.spaceBody":
    "La estrella es el embedding de tu consulta. Los puntos destacados son los chunks recuperados — los scores vienen de Qdrant, no de las distancias 2D.",
  "retrieval.legendQuery": "Consulta",
  "retrieval.legendRetrieved": "Recuperados (Top-K)",
  "retrieval.legendOther": "Otros chunks",
  "retrieval.stage.loadingModel": "Cargando el modelo de embeddings por primera vez…",
  "retrieval.stage.embedding": "Generando embedding con BGE-M3…",
  "retrieval.stage.searching": "Buscando en Qdrant…",

  "playground.retrievalError": "La ejecución falló:",

  "playground.localLlmReady": "LLM local listo",
  "playground.localLlmUnavailable": "LLM LOCAL NO DISPONIBLE",
  "playground.llmUnavailableBody":
    "Ollama no está accesible o el modelo configurado no está instalado.",
  "playground.llmHint": "Inicielo con: ollama serve — y después: ollama pull {model}",
  "playground.modelNotInstalled":
    "El modelo “{model}” no está instalado localmente. Ejecutá: ollama pull {model}",
  "playground.model": "Modelo",
  "playground.modelDefault": "Predeterminado configurado",
  "playground.temperature": "Temperatura",
  "playground.temperatureInfo":
    "Controla cuánta variación tiene el texto del modelo. No controla la veracidad.",
  "playground.generating": "Generando con {model}…",
  "playground.stop": "Detener",
  "playground.llmChip": "LLM LOCAL · Ollama",

  "playground.answer.title": "Respuesta",
  "playground.answer.groundingNote":
    "Esta respuesta fue generada usando el contexto recuperado que se muestra abajo.",
  "playground.answer.noCitation":
    "No se detectó ninguna cita de fuente explícita en esta respuesta.",
  "playground.answer.empty": "El modelo no devolvió una respuesta.",
  "playground.sources.title": "Fuentes",
  "playground.sources.verified": "Fuente verificada",
  "playground.sources.unresolvedTitle": "Cita sin resolver",
  "playground.sources.unresolvedBody":
    "El modelo citó {numbers} — identificadores que no existen en el contexto de esta ejecución. Se muestran pero no se tratan como fuentes reales.",
  "playground.sources.open": "Abrir chunk",
  "playground.prompt.title": "Prompt Inspector",
  "playground.prompt.description":
    "El texto exacto que se envió a Ollama en esta ejecución — no un ejemplo.",
  "playground.prompt.system": "Instrucciones del sistema",
  "playground.prompt.context": "Contexto",
  "playground.prompt.user": "Pregunta del usuario",
  "playground.prompt.view": "Ver el prompt real",
  "playground.prompt.hide": "Ocultar prompt",
  "playground.runInspector.title": "Run Inspector",
  "playground.run.query": "Pregunta",
  "playground.run.retrieval": "Recuperación",
  "playground.run.topK": "Top K",
  "playground.run.results": "Resultados",
  "playground.run.corpus": "Chunks indexados",
  "playground.run.retrievalTime": "Tiempo de recuperación",
  "playground.run.context": "Contexto",
  "playground.run.retrieved": "Chunks recuperados",
  "playground.run.included": "Chunks incluidos",
  "playground.run.estimated": "Tokens estimados",
  "playground.run.prompt": "Prompt",
  "playground.run.model": "Modelo",
  "playground.run.temperature": "Temperatura",
  "playground.run.generation": "Generación",
  "playground.run.generationTime": "Tiempo de generación",
  "playground.run.completionTokens": "Tokens de salida",
  "playground.run.promptTokens": "Tokens de prompt",
  "playground.run.tokensPerSecond": "Tokens / segundo",
  "playground.run.notReported": "Ollama no lo reportó",
  "playground.run.ms": "{ms} ms",
  "playground.run.s": "{s} s",
  "playground.ragVsGen.title": "Recuperación vs generación",
  "playground.ragVsGen.body":
    "La recuperación responde qué chunks son relevantes — matemática sobre vectores. La generación responde cómo redactar la respuesta — el LLM local la escribe. Son pasos separados, con modos de fallo separados.",
  "playground.noDocuments.title": "No hay documentos indexados.",
  "playground.noDocuments.body":
    "Subí e indexá un documento antes de ejecutar RAG.",

  "retrieval.useInPlayground": "Usar en Playground",

  "error.llm_unavailable.title": "LLM local no disponible",
  "error.llm_unavailable.body":
    "Ollama no responde en la URL configurada.",
  "error.llm_model_not_found.title": "Modelo no instalado",
  "error.llm_model_not_found.body":
    "El modelo no está disponible localmente. Descargalo con ollama pull — RAG Inspector nunca descarga modelos por vos.",
  "error.llm_timeout.title": "La generación agotó el tiempo",
  "error.llm_timeout.body":
    "Ollama superó el tiempo máximo configurado. Probá con un modelo más chico o un contexto más corto.",
  "error.generation_failed.title": "La generación falló",
  "error.generation_failed.body":
    "Ollama devolvió un error durante la generación.",
  "error.no_indexed_documents.title": "No hay documentos indexados.",
  "error.no_indexed_documents.body":
    "Subí e indexá un documento antes de ejecutar RAG.",
  "error.invalid_temperature.title": "Temperatura inválida",
  "error.invalid_temperature.body": "La temperatura debe estar entre 0 y 2.",
  "error.cancelled.title": "Generación detenida",
  "error.cancelled.body": "Cancelaste esta ejecución."
};
