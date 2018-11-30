<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

   <xsl:output method="html" indent="yes" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd" />

   <xsl:template match="/">
      <html>
      <head>
         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
         <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body>
         <table>
            <xsl:apply-templates select="/Record/Field" />
         </table>
      </body>
      </html>
   </xsl:template>

   <xsl:template match="Field">
      <tr>
         <td><xsl:value-of select="./@Name" /></td>
         <td>
            <xsl:apply-templates select="./*" />
         </td>
      </tr>
   </xsl:template>

   <xsl:template match="String">
      <xsl:value-of select="." />
   </xsl:template>

   <xsl:template match="Integer">
      <xsl:value-of select="." />
   </xsl:template>

   <xsl:template match="Enumerable">
      <xsl:value-of select="./Variant[@Checked='true']/@Title" />
   </xsl:template>

   <xsl:template match="Flags">
      <xsl:apply-templates select="./Flag[@Condition='true']" />
   </xsl:template>

   <xsl:template match="Flag">
      <xsl:value-of select="./@Title" />
   </xsl:template>

   <xsl:template match="RecordSet">
   </xsl:template>

</xsl:stylesheet>