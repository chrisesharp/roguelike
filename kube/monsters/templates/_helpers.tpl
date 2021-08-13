{{- define "monsters-roguelike.name" -}}
{{ default .Release.Name .Values.global.nameOverride }}
{{- end -}}

{{- define "monsters-roguelike.labels" -}}
helm.sh/chart: {{ .Chart.Name }}
{{ include "monsters-roguelike.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "monsters-roguelike.selectorLabels" -}}
app.kubernetes.io/name: {{ include "monsters-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "monsters-roguelike.imageName" -}}
{{ default (include "monsters-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}