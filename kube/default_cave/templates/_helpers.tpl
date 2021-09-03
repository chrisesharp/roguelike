{{- define "cave-roguelike.name" -}}
{{ .Values.caveid }}
{{- end -}}

{{- define "cave-roguelike.labels" -}}
{{ include "roguelike.labels" . }}
{{ include "cave-roguelike.selectorLabels" . }}
{{- end -}}

{{- define "cave-roguelike.selectorLabels" -}}
app.kubernetes.io/component: {{ include "cave-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "cave-roguelike.imageName" -}}
{{ default (include "cave-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}

{{- define "monsters-roguelike.name" -}}
monsters-{{ .Values.caveid }}
{{- end -}}

{{- define "monsters-roguelike.labels" -}}
{{ include "roguelike.labels" . }}
{{ include "monsters-roguelike.selectorLabels" . }}
{{- end }}

{{- define "monsters-roguelike.selectorLabels" -}}
app.kubernetes.io/component: {{ include "monsters-roguelike.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "monsters-roguelike.imageName" -}}
{{ default (include "monsters-roguelike.name" .) .Values.image.name }}:{{ .Values.image.tag }}
{{- end -}}

{{- define "roguelike.labels" -}}
app.kubernetes.io/name: {{ default .Release.Name .Values.global.nameOverride }}
helm.sh/chart: {{ .Chart.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}