{{- define "cavern-service-roguelike.name" -}}
{{ .Values.servicename }}
{{- end -}}

{{- define "cavern-service-roguelike.labels" -}}
{{ include "roguelike.labels" . }}
{{ include "cavern-service-roguelike.selectorLabels" . }}
{{- end }}

{{- define "cavern-service-roguelike.selectorLabels" -}}
app.kubernetes.io/component: {{ include "cavern-service-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "cavern-service-roguelike.imageName" -}}
{{ default (include "cavern-service-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}

{{- define "entrance-roguelike.name" -}}
entrance
{{- end -}}

{{- define "entrance-roguelike.labels" -}}
{{ include "roguelike.labels" . }}
{{ include "entrance-roguelike.selectorLabels" . }}
{{- end }}

{{- define "entrance-roguelike.selectorLabels" -}}
app.kubernetes.io/component: {{ include "entrance-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "entrance-roguelike.imageName" -}}
{{ default (include "entrance-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}

{{- define "roguelike.labels" -}}
app.kubernetes.io/name: {{ default .Release.Name .Values.global.nameOverride }}
helm.sh/chart: {{ .Chart.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
