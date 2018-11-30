<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

   <xsl:output method="html" encoding="utf-8" indent="yes" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd" />

   <xsl:variable name="paddingValue" select="10" />
   <xsl:variable name="hierarchyField" select="./RecordSet/@HierarchyField" />
   <xsl:variable name="hierarchyName" select="./RecordSet/@HierarchyName" />
   <xsl:variable name="columnsCount" select="count(./RecordSet/Columns/Column)" />
   <xsl:variable name="hasHierarchy" select="count($hierarchyField) > 0" />
   <xsl:variable name="rootNode" select="./RecordSet/@Root" />
   <xsl:variable name="root" select="." />


   <xsl:template match="/">

      <html>
      <head>
         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
         <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
         <style type="text/css" media="all">
            * {
               font-family: Tahoma;
               font-size: 11px;
            }
            .ws-register-table {
               width: 100%;
               border-collapse: collapse;
               line-height: 15px;
               min-width: 430px;
            }
            .ws-register-table th{
               color: #999999;
               font-weight: normal;
               text-align: left;
            }
            .ws-register-table th,
            .ws-register-table td {
               padding: 1px 5px;
            }
            .ws-register-table .td-break-all {
               word-break: break-all;
            }
            .ws-register-table tbody tr {
               border-top: 1px solid #F5F5F5;
            }
            .ws-register-table tbody {
               border-bottom: 1px solid #EAEAEA;
               border-top: 1px solid #EAEAEA;
            }
            .ws-register-table tbody tr:first-child{
               border-top-style: none;
            }
            .ws-register-table td.ws-register-folder {
               font-weight: bold;
            }
            .ws-register-table thead {
               display: table-header-group
            }
            .ws-register-table tfoot {
               display: table-row-group
            }
            .ws-register-table tr {
               page-break-inside: avoid
            }
         </style>
      </head>
      <body>
         <table class="ws-register-table">
            <thead>
               <tr>
                  <xsl:for-each select="/RecordSet/Columns/Column">
                     <th>
                        <xsl:value-of select="@Name" />
                     </th>
                  </xsl:for-each>
               </tr>
            </thead>
            <tbody>
               <xsl:if test="$hasHierarchy">
                  <xsl:call-template name="oneRow">
                     <xsl:with-param name="records" select="./RecordSet/Record[count(Field[@Name = $hierarchyField and Hierarchy/Parent = $rootNode]) > 0]" />
                  </xsl:call-template>
               </xsl:if>
               <xsl:if test="not($hasHierarchy)">
                  <xsl:call-template name="oneRow">
                     <xsl:with-param name="records" select="./RecordSet/Record" />
                  </xsl:call-template>
               </xsl:if>
            </tbody>
         </table>
      </body>
      </html>
   </xsl:template>

   <xsl:template name="oneRow">
      <xsl:param name="records" />
      <xsl:param name="padding" select="0" />
      <xsl:for-each select="$records">
         <xsl:variable name="record" select="." />
         <xsl:if test="./Field[@Name = $hierarchyField]/Hierarchy/NodeType = 'Узел' and $hasHierarchy">
            <tr>
               <td class="ws-register-folder">
                  <xsl:attribute name="style">
                     <xsl:value-of select="concat('padding-left:', 5 + $padding * $paddingValue, 'px;')" />
                  </xsl:attribute>
                  <xsl:attribute name="colspan">
                     <xsl:value-of select="$columnsCount" />
                  </xsl:attribute>
                  <xsl:value-of select="./Field[@Name = $hierarchyName]" />
               </td>
            </tr>
            <xsl:call-template name="oneRow">
               <xsl:with-param name="padding" select="$padding + 1" />
               <xsl:with-param name="records" select="$root/RecordSet/Record[count(Field[@Name = $hierarchyField and Hierarchy/Parent = current()/@RecordKey]) > 0]" />
            </xsl:call-template>
         </xsl:if>
         <xsl:if test="./Field[@Name = $hierarchyField]/Hierarchy/NodeType != 'Узел' or not($hasHierarchy)">
            <tr>
               <xsl:for-each select="/RecordSet/Columns/Column">
                  <xsl:variable name="field" select="@Field" />
                  <xsl:variable name="breakText" select="@BreakText" />
                  <xsl:variable name="type" select="name($record/Field[@Name = $field]/*[1])" />
                  <xsl:variable name="isInteger" select="$type = 'ЧислоЦелое'" />
                  <xsl:variable name="isFloat" select="$type = 'ЧислоВещественное'" />
                  <xsl:variable name="isMoney" select="$type = 'Деньги'" />
                  <td>
                     <xsl:if test="position() = 1">
                        <xsl:attribute name="style">
                           <xsl:value-of select="concat('padding-left:', 5 + $padding * $paddingValue, 'px;')" />
                        </xsl:attribute>
                     </xsl:if>
                     <xsl:variable name="classNameType">
                        <xsl:choose>
                           <xsl:when test="$isInteger">
                              <xsl:text>ws-browser-type-integer</xsl:text>
                           </xsl:when>
                           <xsl:when test="$isFloat">
                              <xsl:text>ws-browser-type-float</xsl:text>
                           </xsl:when>
                           <xsl:when test="$isMoney">
                              <xsl:text>ws-browser-type-money</xsl:text>
                           </xsl:when>
                           <xsl:otherwise>
                              <xsl:text>ws-browser-type-string</xsl:text>
                           </xsl:otherwise>
                        </xsl:choose>
                     </xsl:variable>
                     <xsl:variable name="className">
                        <xsl:if test="$breakText = 'true'">
                           <xsl:text>td-break-all</xsl:text>
                        </xsl:if>
                     </xsl:variable>
                     <xsl:attribute name="class">
                        <xsl:value-of select="concat(concat($classNameType, ' '), $className)" />
                     </xsl:attribute>
                     <xsl:if test="$record/Field[@Name = $field] != 'null'">
                        <xsl:apply-templates select="$record/Field[@Name = $field]" />
                     </xsl:if>
                  </td>
               </xsl:for-each>
            </tr>
         </xsl:if>
      </xsl:for-each>
   </xsl:template>

   <xsl:template match="Integer|Double|integer|double">
      <div><xsl:value-of select="." /></div>
   </xsl:template>

   <xsl:decimal-format name="money" grouping-separator=" " decimal-separator="." NaN="" />
   <xsl:template match="Money|money">
      <div><xsl:value-of select="format-number(., '# ##0.00', 'money')" /></div>
   </xsl:template>

   <xsl:template match="Text|String|Boolean|text|string|boolean">
      <xsl:value-of select="." />
   </xsl:template>

   <xsl:template match="Time|time">
      <xsl:value-of select="substring(.,1,8)" />
   </xsl:template>
   <xsl:template match="Date|date">
      <xsl:value-of select="concat(substring(.,9,2), '.', substring(.,6,2), '.', substring(.,3,2))" />
   </xsl:template>
   <xsl:template match="DateTime|datetime">
      <xsl:value-of select="concat(substring(.,9,2), '.', substring(.,6,2), '.', substring(.,3,2), ' ', substring(.,12,8))" />
   </xsl:template>

   <xsl:template match="Enumerable|enumerable">
      <xsl:value-of select="./Variant[@Checked='true']/@Title" />
   </xsl:template>

   <xsl:template match="Flags|flags">
      <xsl:apply-templates select="./Flag[@Condition='true']" />
   </xsl:template>

   <xsl:template match="Flag|flag">
      <xsl:value-of select="./@Title" />
   </xsl:template>

</xsl:stylesheet>