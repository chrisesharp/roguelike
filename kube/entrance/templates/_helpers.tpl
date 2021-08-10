{{- define "entrance-roguelike.name" -}}
{{ default .Release.Name .Values.global.nameOverride }}
{{- end -}}

{{- define "entrance-roguelike.labels" -}}
helm.sh/chart: {{ .Chart.Name }}
{{ include "entrance-roguelike.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "entrance-roguelike.selectorLabels" -}}
app.kubernetes.io/name: {{ include "entrance-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "entrance-roguelike.imageName" -}}
{{ default (include "entrance-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}