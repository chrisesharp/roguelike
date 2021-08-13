{{- define "cavern-service-roguelike.name" -}}
{{ default .Release.Name .Values.global.nameOverride }}
{{- end -}}

{{- define "cavern-service-roguelike.labels" -}}
helm.sh/chart: {{ .Chart.Name }}
{{ include "cavern-service-roguelike.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "cavern-service-roguelike.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cavern-service-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "cavern-service-roguelike.imageName" -}}
{{ default (include "cavern-service-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}