const sb = supabase.createClient(
  "https://pdajixsoowcyhnjwhgpc.supabase.co",
  "sb_publishable_LatlFlcxk6IchHe3RNmfwA_9Oq4EsZw"
);

async function carregar(){
  const { data:locacoes } = await sb.from("locacoes").select("*").order("created_at",{ascending:false});
  const { data:veiculos } = await sb.from("veiculos").select("id,modelo");

  const mapa={}; veiculos.forEach(v=>mapa[v.id]=v.modelo);
  const lista=document.getElementById("lista");
  lista.innerHTML="";

  locacoes.forEach(l=>{
    lista.innerHTML+=`
      <div class="card">
        <h3>🚗 ${mapa[l.veiculo_id]||"Veículo"}</h3>
        <p><b>Cliente:</b> ${l.nome}</p>
        <p><b>Telefone:</b> ${l.telefone}</p>
        <p><b>Dias:</b> ${l.dias}</p>
        <p><b>Total:</b> R$ ${l.total}</p>
        <span class="badge ${l.status}">${l.status.toUpperCase()}</span>

        <div class="actions">
          <button class="btn pdf" onclick="gerarEEnviarPDF('${l.id}')">📄 Aprovar + PDF</button>
          <button class="btn recusar" onclick="recusar('${l.id}')">Recusar</button>
          <button class="btn excluir" onclick="excluir('${l.id}')">Excluir</button>
        </div>
      </div>
    `;
  });
}

async function gerarEEnviarPDF(id){
  const { jsPDF } = window.jspdf;
  const { data:l } = await sb.from("locacoes").select("*").eq("id",id).single();
  const pdf=new jsPDF();

  pdf.text("CONTRATO DE LOCAÇÃO",10,20);
  pdf.text(`Cliente: ${l.nome}`,10,30);
  pdf.text(`Telefone: ${l.telefone}`,10,40);
  pdf.text(`Dias: ${l.dias}`,10,50);
  pdf.text(`Total: R$ ${l.total}`,10,60);

  const url=URL.createObjectURL(pdf.output("blob"));
  await sb.from("locacoes").update({status:"ativa"}).eq("id",id);

  window.open(
    "https://wa.me/55"+l.telefone.replace(/\D/g,"")+
    "?text="+encodeURIComponent("Contrato aprovado:\n"+url),
    "_blank"
  );

  carregar();
}

async function recusar(id){
  await sb.from("locacoes").update({status:"recusada"}).eq("id",id);
  carregar();
}

async function excluir(id){
  if(confirm("Excluir locação?")){
    await sb.from("locacoes").delete().eq("id",id);
    carregar();
  }
}

carregar();
