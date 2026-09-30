from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from pathlib import Path
out=Path('output/pdf');out.mkdir(parents=True,exist_ok=True)
for kind in ['floorplan','brochure','epc']:
 c=canvas.Canvas(str(out/f'demo-{kind}.pdf'),pagesize=(595,842));c.setTitle('Northfield & Co. - Fictional '+kind)
 c.setFillColor(HexColor('#f7f5ef'));c.rect(0,0,595,842,fill=1,stroke=0);c.setFillColor(HexColor('#183d36'));c.rect(0,740,595,102,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setFont('Times-Roman',27);c.drawString(45,787,'Northfield & Co.');c.setFont('Helvetica',9);c.drawString(45,764,'FICTIONAL DEMONSTRATION - NOT FOR PROPERTY TRANSACTIONS')
 c.setFillColor(HexColor('#183d36'));c.setFont('Times-Roman',30);c.drawString(45,690,{'floorplan':'Illustrative floorplan','brochure':'A home, imagined.','epc':'Energy information - DEMO'}[kind]);c.setFont('Helvetica',11)
 if kind=='floorplan':
  c.drawString(45,656,'Generic sample plan. Not to scale. Does not describe any listed property.')
  for x,y,w,h,label in [(60,380,235,210,'Living / dining'),(295,380,235,210,'Kitchen'),(60,220,235,160,'Bedroom'),(295,220,235,160,'Bathroom / hall')]:
   c.setLineWidth(3);c.setStrokeColor(HexColor('#183d36'));c.rect(x,y,w,h);c.drawCentredString(x+w/2,y+h/2,label)
  c.setFont('Helvetica',10);c.drawString(60,180,'Illustrative layout only. Room sizes and structural details are not supplied.')
 elif kind=='brochure':
  for y,line in zip(range(635,480,-28),['A fictional collection of homes across Alderwick, Mereford and Bracken Hill.','This PDF demonstrates an editable brochure file field in EmDash.','Property information on the demo site is invented.','Stock photographs are illustrative and do not show the stated addresses.','No real properties, valuations or transactions are offered.']):c.drawString(45,y,line)
  c.setFont('Times-Roman',23);c.drawString(45,380,'Independent minds. Local roots.')
 else:
  c.drawString(45,650,'This is NOT an Energy Performance Certificate. No assessor has issued it.')
  c.drawString(45,627,'It demonstrates the CMS document field only. Ratings on the site are invented.')
  for i,(label,color) in enumerate(zip('ABCDEFG',['#31704c','#518445','#789542','#b4a83e','#c29139','#b87539','#a7543b'])):
   y=560-i*42;c.setFillColor(HexColor(color));c.rect(45,y,160+i*37,32,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',13);c.drawString(58,y+10,label+'  - illustrative band')
 c.setFillColor(HexColor('#183d36'));c.setFont('Helvetica',9);c.drawString(45,55,'Fictional demo | northfield.example | No real property information');c.save()
print('Created 3 demonstration PDFs')
