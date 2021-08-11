{{- define "cave-roguelike.name" -}}
{{ default .Release.Name .Values.global.nameOverride }}
{{- end -}}

{{- define "cave-roguelike.labels" -}}
helm.sh/chart: {{ .Chart.Name }}
{{ include "cave-roguelike.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "cave-roguelike.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cave-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "cave-roguelike.imageName" -}}
{{ default (include "cave-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}